import * as fs from 'fs';
import * as path from 'path';
import { ChapterGoal, ProgressData, ProgressLogEntry, WritingGoals } from './types';

const defaultProgressData = (): ProgressData => ({
  version: 1,
  log: []
});

export interface DailySnapshot {
  date: string;
  totalWords: number;
  wordsToday: number;
  isBaseline: boolean;
}

export interface ChapterGoalStatus {
  coords: string;
  words: number;
  goal: ChapterGoal;
  status: 'ok' | 'under' | 'over';
  percent: number;
}

export class GoalTracker {
  public progressPath: string;
  public data: ProgressData;

  constructor(progressPath: string) {
    this.progressPath = path.resolve(progressPath);
    this.data = defaultProgressData();
    this.loadProgress();
  }

  public loadProgress(): void {
    if (!fs.existsSync(this.progressPath)) {
      this.data = defaultProgressData();
      return;
    }

    try {
      const content = fs.readFileSync(this.progressPath, 'utf8').trim();
      if (!content) {
        this.data = defaultProgressData();
        return;
      }
      const parsed = JSON.parse(content) as Partial<ProgressData>;
      this.data = {
        version: typeof parsed.version === 'number' ? parsed.version : 1,
        log: Array.isArray(parsed.log) ? parsed.log : []
      };
    } catch (err) {
      console.warn(
        `Warning: Failed to parse progress file. Initializing empty log. Error: ${(err as Error).message}`
      );
      this.data = defaultProgressData();
    }
  }

  public saveProgress(): void {
    const dir = path.dirname(this.progressPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.progressPath, JSON.stringify(this.data, null, 2), 'utf8');
  }

  /**
   * Records (or updates) today's total word count and returns the words
   * written today relative to the most recent earlier entry. The first
   * ever entry is a baseline: wordsToday is 0 by definition.
   */
  public recordSnapshot(totalWords: number, date: string = GoalTracker.today()): DailySnapshot {
    const previous = this._latestBefore(date);
    const existing = this.data.log.find((entry) => entry.date === date);

    if (existing) {
      existing.totalWords = totalWords;
    } else {
      this.data.log.push({ date, totalWords });
      this.data.log.sort((a, b) => a.date.localeCompare(b.date));
    }
    this.saveProgress();

    return {
      date,
      totalWords,
      wordsToday: previous ? totalWords - previous.totalWords : 0,
      isBaseline: !previous
    };
  }

  /**
   * Evaluates per-chapter min/max word goals against actual counts.
   */
  public static evaluateChapterGoals(
    goals: WritingGoals,
    chapterWordCounts: Map<string, number>
  ): ChapterGoalStatus[] {
    const perChapter = goals.perChapter || {};
    return Object.entries(perChapter).map(([coords, goal]) => {
      const words = chapterWordCounts.get(coords) || 0;
      let status: ChapterGoalStatus['status'] = 'ok';
      if (typeof goal.min === 'number' && words < goal.min) status = 'under';
      else if (typeof goal.max === 'number' && words > goal.max) status = 'over';

      const reference = typeof goal.min === 'number' ? goal.min : goal.max;
      const percent =
        typeof reference === 'number' && reference > 0
          ? Math.min(100, Math.round((words / reference) * 100))
          : 100;

      return { coords, words, goal, status, percent };
    });
  }

  /**
   * Renders a zero-dependency progress bar like: [██████░░░░] 60% (600/1000)
   */
  public static renderBar(current: number, target: number, width: number = 20): string {
    if (target <= 0) {
      return `[${'░'.repeat(width)}] 0% (${current}/${target})`;
    }
    const ratio = Math.max(0, Math.min(1, current / target));
    const filled = Math.round(ratio * width);
    const percent = Math.round((current / target) * 100);
    return `[${'█'.repeat(filled)}${'░'.repeat(width - filled)}] ${percent}% (${current}/${target})`;
  }

  public static today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private _latestBefore(date: string): ProgressLogEntry | null {
    let latest: ProgressLogEntry | null = null;
    this.data.log.forEach((entry) => {
      if (entry.date < date && (!latest || entry.date > latest.date)) {
        latest = entry;
      }
    });
    return latest;
  }
}
export default GoalTracker;
