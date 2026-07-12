import * as fs from 'fs';
import { GoalTracker } from '../src/GoalTracker';

jest.mock('fs');

describe('GoalTracker', () => {
  const progressPath = './progress.json';
  let tracker: GoalTracker;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize an empty log if the file does not exist', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    tracker = new GoalTracker(progressPath);

    expect(tracker.data).toEqual({ version: 1, log: [] });
  });

  it('should load an existing log', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify({ version: 1, log: [{ date: '2026-07-10', totalWords: 500 }] })
    );

    tracker = new GoalTracker(progressPath);
    expect(tracker.data.log).toHaveLength(1);
  });

  it('should fallback to an empty log when parsing fails', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue('broken{');
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    tracker = new GoalTracker(progressPath);
    expect(tracker.data).toEqual({ version: 1, log: [] });
    spy.mockRestore();
  });

  it('should treat the first snapshot as a baseline', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    tracker = new GoalTracker(progressPath);

    const snapshot = tracker.recordSnapshot(1200, '2026-07-10');

    expect(snapshot.isBaseline).toBe(true);
    expect(snapshot.wordsToday).toBe(0);
    expect(tracker.data.log).toEqual([{ date: '2026-07-10', totalWords: 1200 }]);
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('should compute the daily delta against the most recent earlier entry', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    tracker = new GoalTracker(progressPath);

    tracker.recordSnapshot(1200, '2026-07-10');
    const snapshot = tracker.recordSnapshot(2000, '2026-07-12');

    expect(snapshot.isBaseline).toBe(false);
    expect(snapshot.wordsToday).toBe(800);
    expect(tracker.data.log.map((e) => e.date)).toEqual(['2026-07-10', '2026-07-12']);
  });

  it('should update the same-day entry instead of appending, keeping the delta stable', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    tracker = new GoalTracker(progressPath);

    tracker.recordSnapshot(1000, '2026-07-10');
    tracker.recordSnapshot(1500, '2026-07-11');
    const updated = tracker.recordSnapshot(1900, '2026-07-11');

    expect(tracker.data.log).toHaveLength(2);
    expect(updated.wordsToday).toBe(900);
    expect(tracker.data.log.find((e) => e.date === '2026-07-11')?.totalWords).toBe(1900);
  });

  it('should keep the log sorted when snapshots arrive out of order', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    tracker = new GoalTracker(progressPath);

    tracker.recordSnapshot(2000, '2026-07-12');
    tracker.recordSnapshot(1000, '2026-07-01');

    expect(tracker.data.log.map((e) => e.date)).toEqual(['2026-07-01', '2026-07-12']);
  });

  it('should evaluate chapter goals as under, over, or within range', () => {
    const goals = {
      perChapter: {
        '1.1': { min: 1000, max: 2000 },
        '1.2': { min: 1000 },
        '1.3': { max: 500 }
      }
    };
    const counts = new Map<string, number>([
      ['1.1', 1500],
      ['1.2', 400],
      ['1.3', 900]
    ]);

    const rows = GoalTracker.evaluateChapterGoals(goals, counts);
    const byCoords = new Map(rows.map((r) => [r.coords, r]));

    expect(byCoords.get('1.1')?.status).toBe('ok');
    expect(byCoords.get('1.2')?.status).toBe('under');
    expect(byCoords.get('1.2')?.percent).toBe(40);
    expect(byCoords.get('1.3')?.status).toBe('over');
  });

  it('should treat chapters missing from the manuscript as zero words', () => {
    const rows = GoalTracker.evaluateChapterGoals(
      { perChapter: { '9.9': { min: 100 } } },
      new Map()
    );
    expect(rows[0].words).toBe(0);
    expect(rows[0].status).toBe('under');
  });

  it('should render progress bars including edge cases', () => {
    expect(GoalTracker.renderBar(500, 1000, 10)).toBe('[█████░░░░░] 50% (500/1000)');
    expect(GoalTracker.renderBar(1000, 1000, 10)).toBe('[██████████] 100% (1000/1000)');
    expect(GoalTracker.renderBar(1500, 1000, 10)).toBe('[██████████] 150% (1500/1000)');
    expect(GoalTracker.renderBar(0, 0, 10)).toBe('[░░░░░░░░░░] 0% (0/0)');
  });

  it('should format today as YYYY-MM-DD', () => {
    expect(GoalTracker.today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
