import * as fs from 'fs';
import * as path from 'path';
import { BookCompiler } from './BookCompiler';
import { Chapter } from './Chapter';
import { CharacterManager } from './CharacterManager';
import { PlotManager } from './PlotManager';
import { WorldManager } from './WorldManager';
import { StoryContextBuilder } from './StoryContextBuilder';
import { ProseAnalyzer } from './ProseAnalyzer';
import { MemoryManager } from './MemoryManager';
import { Locale } from './Locale';
import { PlotEvent } from './types';

export type ReviewType = 'continuity' | 'style' | 'plotholes';

export interface ReviewFinding {
  severity: string;
  kind?: string;
  entityId?: string;
  coords?: string;
  quote?: string;
  explanation: string;
}

export interface ReviewResult {
  findings: ReviewFinding[];
  summary?: string;
}

const REVIEW_TYPES: ReviewType[] = ['continuity', 'style', 'plotholes'];

// The packaged review context is agent-facing and intentionally English,
// mirroring the analyze:context / diagnostics-guide precedent.
const FINDINGS_SCHEMA = `{
  "findings": [
    {
      "severity": "high | medium | low",
      "kind": "continuity | style | plothole",
      "entityId": "optional story-bible id (character/place/event/thread)",
      "coords": "optional chapter coordinates like 1.2",
      "quote": "optional short quote from the manuscript",
      "explanation": "what is wrong and why (required)"
    }
  ],
  "summary": "optional overall assessment"
}`;

export class ReviewManager {
  public compiler: BookCompiler;

  constructor(compiler: BookCompiler) {
    this.compiler = compiler;
  }

  public static normalizeType(input: string): ReviewType {
    const cleaned = input.trim().toLowerCase();
    if ((REVIEW_TYPES as string[]).includes(cleaned)) {
      return cleaned as ReviewType;
    }
    throw new Error(`Unknown review type: "${input}". Supported: ${REVIEW_TYPES.join(', ')}`);
  }

  /**
   * Packages a facilitator-pattern review context for an external AI agent.
   * `coords` is "sec.chap" or "all" (book-wide; plotholes only).
   */
  public packageContext(type: ReviewType, coords: string): string {
    const isBookWide = coords.trim().toLowerCase() === 'all';
    if (isBookWide && type !== 'plotholes') {
      throw new Error(`Book-wide review ("all") is only supported for --type plotholes.`);
    }

    this._ensureLoaded();
    const targetChapter = isBookWide ? null : this._findChapterOrThrow(coords);

    const blocks: string[] = [];
    blocks.push(
      `=== REVIEW TASK: ${type.toUpperCase()} (${isBookWide ? 'WHOLE BOOK' : coords}) ===`
    );
    blocks.push(this._instructionsFor(type));
    blocks.push(`=== EXPECTED OUTPUT SCHEMA (JSON) ===\n${FINDINGS_SCHEMA}`);

    if (type === 'continuity') {
      blocks.push(this._storyBibleBlock(targetChapter!));
      blocks.push(this._chronologyBlock());
      blocks.push(this._chapterBlock(targetChapter!));
    } else if (type === 'style') {
      blocks.push(this._memoryBlock(targetChapter!));
      blocks.push(this._speechStylesBlock());
      blocks.push(this._proseMetricsBlock(targetChapter!));
      blocks.push(this._chapterBlock(targetChapter!));
    } else {
      blocks.push(this._synopsesBlock());
      blocks.push(this._chronologyBlock());
      blocks.push(this._unresolvedSetupsBlock());
      blocks.push(this._openThreadsBlock());
      blocks.push(this._worldRulesBlock());
      if (targetChapter) {
        blocks.push(this._chapterBlock(targetChapter));
      }
    }

    return blocks.filter(Boolean).join('\n\n');
  }

  /**
   * Validates and renders the agent's findings JSON, logs it under
   * diagnostics/, and optionally feeds findings back into memory.json.
   */
  public reportFindings(
    type: ReviewType,
    coords: string,
    tempFilePath: string,
    learn: boolean = false
  ): void {
    if (!fs.existsSync(tempFilePath)) {
      throw new Error(`Review findings file not found: ${tempFilePath}`);
    }

    let result: ReviewResult;
    try {
      result = JSON.parse(fs.readFileSync(tempFilePath, 'utf8'));
    } catch (e) {
      throw new Error('Failed to parse review findings file. Must be valid JSON.');
    }
    if (!result || !Array.isArray(result.findings)) {
      throw new Error('Review findings file is missing the "findings" array.');
    }
    result.findings.forEach((finding, idx) => {
      if (!finding || typeof finding.explanation !== 'string' || !finding.explanation.trim()) {
        throw new Error(`Finding #${idx + 1} is missing the required "explanation" field.`);
      }
    });

    const lang = this.compiler.config.language;
    const normalizedCoords = coords.trim().toLowerCase() === 'all' ? 'all' : coords;

    console.log(`\n${Locale.get('reviewReportTitle', lang, { type, coords: normalizedCoords })}`);

    if (result.findings.length === 0) {
      console.log(Locale.get('reviewNoFindings', lang));
    } else {
      this._printFindingsTable(result.findings, lang);
    }

    if (result.summary) {
      console.log(`\n${Locale.get('reviewSummaryLabel', lang)}:\n${result.summary}`);
    }

    const projectDir = path.dirname(this.compiler.config.assetsDir);
    const diagnosticsDir = path.join(projectDir, 'diagnostics');
    if (!fs.existsSync(diagnosticsDir)) {
      fs.mkdirSync(diagnosticsDir, { recursive: true });
    }
    const logPath = path.join(diagnosticsDir, `review_${type}_${normalizedCoords}.json`);
    fs.writeFileSync(
      logPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          type,
          coords: normalizedCoords,
          findings: result.findings,
          summary: result.summary || ''
        },
        null,
        2
      ),
      'utf8'
    );
    console.log(Locale.get('reviewSaved', lang, { path: logPath }));

    if (learn && result.findings.length > 0) {
      const memoryManager = new MemoryManager(path.join(projectDir, 'memory.json'));
      const scope = /^\d+\.\d+$/.test(normalizedCoords) ? normalizedCoords : 'global';
      result.findings.forEach((finding) => {
        memoryManager.learn(scope, {
          feedback: `[review:${type}] ${finding.explanation.trim()}`
        });
      });
      console.log(Locale.get('reviewLearned', lang, { count: result.findings.length }));
    }
  }

  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------

  private _ensureLoaded(): void {
    if (this.compiler.sections.length === 0) {
      this.compiler.scanAndLoad();
    }
  }

  private _findChapterOrThrow(coords: string): Chapter {
    const parts = coords.split('.');
    const sectionNum = parseInt(parts[0], 10);
    const chapterNum = parseInt(parts[1], 10);
    if (isNaN(sectionNum) || isNaN(chapterNum)) {
      throw new Error(`Invalid coordinates: "${coords}". Use "sec.chap" (e.g. 1.2) or "all".`);
    }
    for (const section of this.compiler.sections) {
      for (const chapter of section.chapters) {
        if (chapter.sectionNum === sectionNum && chapter.chapterNum === chapterNum) {
          return chapter;
        }
      }
    }
    throw new Error(`Target chapter ${coords} not found.`);
  }

  private _managers(): { characters: CharacterManager; plot: PlotManager; world: WorldManager } {
    const assetsDir = this.compiler.config.assetsDir;
    return {
      characters: new CharacterManager(path.join(assetsDir, 'characters.json')),
      plot: new PlotManager(path.join(assetsDir, 'plot.json')),
      world: new WorldManager(path.join(assetsDir, 'world.json'))
    };
  }

  private _instructionsFor(type: ReviewType): string {
    const shared =
      'You are an editorial review agent. Analyze the material below and output ONLY a JSON object matching the schema. ' +
      'Do NOT re-report issues that `bitig check` already detects mechanically (dangling ids, unknown coordinates, date/order conflicts).';
    if (type === 'continuity') {
      return (
        `${shared}\n` +
        '- Compare the chapter text against the character cards, timeline, and world rules.\n' +
        '- Flag contradictions in character traits, knowledge, injuries, locations, timeline order, and world rules.\n' +
        '- Flag characters acting against their established relationships or arc state.'
      );
    }
    if (type === 'style') {
      return (
        `${shared}\n` +
        "- Evaluate the chapter against the recorded stylistic decisions and each character's speechStyle.\n" +
        '- Use the prose metrics to spot over-long sentences, repetition, and dialogue/narration imbalance.\n' +
        '- Suggest concrete rewrites in the explanation field where useful.'
      );
    }
    return (
      `${shared}\n` +
      "- Hunt for plot holes: unresolved setups (Chekhov's guns), abandoned threads, unexplained knowledge, impossible logistics.\n" +
      '- Check every setup event without a payoff and every open thread: is it intentional at this point of the book?\n' +
      '- Suggest foreshadowing opportunities as low-severity findings.'
    );
  }

  private _storyBibleBlock(chapter: Chapter): string {
    const { characters, plot, world } = this._managers();
    const builder = new StoryContextBuilder(characters, plot, world);
    const block = builder.buildStoryBlock({
      sectionNum: chapter.sectionNum,
      chapterNum: chapter.chapterNum,
      targetText: chapter.rawContent,
      precedingText: '',
      activeLayers: ['characters', 'plot', 'world'],
      language: this.compiler.config.language
    });
    return block ? `=== STORY BIBLE (RELEVANT SCOPE) ===\n${block.trim()}` : '';
  }

  private _chronologyBlock(): string {
    const { plot } = this._managers();
    const chronology = plot.getChronology();
    if (chronology.length === 0) return '';
    const lines = chronology.map((e) => this._eventLine(e));
    return `=== FULL EVENT CHRONOLOGY ===\n${lines.join('\n')}`;
  }

  private _eventLine(e: PlotEvent): string {
    const markers: string[] = [];
    if (typeof e.order === 'number') markers.push(`#${e.order}`);
    if (e.date) markers.push(e.date);
    const marker = markers.length > 0 ? `[${markers.join(' | ')}] ` : '';
    const type =
      e.type && e.type !== 'event' ? ` {${e.type}${e.payoffFor ? ` of ${e.payoffFor}` : ''}}` : '';
    const chars = e.characterIds?.length ? ` (chars: ${e.characterIds.join(', ')})` : '';
    const coords = e.coords?.length ? ` [${e.coords.join(', ')}]` : '';
    return `- ${marker}${e.id}: ${e.title}${type}${e.summary ? ` — ${e.summary}` : ''}${chars}${coords}`;
  }

  private _chapterBlock(chapter: Chapter): string {
    return `=== CHAPTER CONTENT (${chapter.sectionNum}.${chapter.chapterNum} "${chapter.title}") ===\n\`\`\`markdown\n${chapter.rawContent}\n\`\`\``;
  }

  private _memoryBlock(chapter: Chapter): string {
    const projectDir = path.dirname(this.compiler.config.assetsDir);
    const memoryManager = new MemoryManager(path.join(projectDir, 'memory.json'));
    const formatted = memoryManager.getFormattedMemory(
      { sectionNum: chapter.sectionNum, chapterNum: chapter.chapterNum },
      ['global', 'section', 'chapter'],
      this.compiler.config.language
    );
    return formatted ? `=== RECORDED STYLE MEMORY ===\n${formatted.trim()}` : '';
  }

  private _speechStylesBlock(): string {
    const { characters } = this._managers();
    const lines = characters
      .listCharacters()
      .filter((c) => c.speechStyle)
      .map((c) => `- ${c.name} (\`${c.id}\`): ${c.speechStyle}`);
    return lines.length > 0 ? `=== CHARACTER SPEECH STYLES ===\n${lines.join('\n')}` : '';
  }

  private _proseMetricsBlock(chapter: Chapter): string {
    const analyzer = new ProseAnalyzer(this.compiler);
    const analysis = analyzer.analyzeChapter(chapter.sectionNum, chapter.chapterNum, 10);
    return `=== PROSE METRICS (computed locally) ===\n\`\`\`json\n${JSON.stringify(analysis, null, 2)}\n\`\`\``;
  }

  private _synopsesBlock(): string {
    const lines: string[] = [];
    const metadataGen = this.compiler.metadataGenerator;
    if (metadataGen) {
      const metadata = JSON.parse(metadataGen.generateJSONMetadata());
      metadata.structure.forEach((sec: { sectionNum: number; title: string; chapters: any[] }) => {
        lines.push(`Section ${sec.sectionNum}: ${sec.title}`);
        sec.chapters.forEach((chap: { chapterNum: number; title: string; synopsis?: string }) => {
          lines.push(
            `  - ${sec.sectionNum}.${chap.chapterNum} "${chap.title}": ${chap.synopsis || '(no content)'}`
          );
        });
      });
    }
    return lines.length > 0 ? `=== BOOK STRUCTURE & SYNOPSES ===\n${lines.join('\n')}` : '';
  }

  private _unresolvedSetupsBlock(): string {
    const { plot } = this._managers();
    const events = plot.data.events;
    const paidOff = new Set(
      events.filter((e) => e.type === 'payoff' && e.payoffFor).map((e) => e.payoffFor as string)
    );
    const unresolved = events.filter((e) => e.type === 'setup' && !paidOff.has(e.id));
    if (unresolved.length === 0) return '';
    const lines = unresolved.map((e) => this._eventLine(e));
    return `=== SETUP EVENTS WITHOUT A PAYOFF (Chekhov's guns) ===\n${lines.join('\n')}`;
  }

  private _openThreadsBlock(): string {
    const { plot } = this._managers();
    const open = plot.getOpenThreads();
    if (open.length === 0) return '';
    const lines = open.map(
      (t) =>
        `- ${t.id}: ${t.title}${t.introducedIn ? ` (introduced in ${t.introducedIn})` : ''}${t.summary ? ` — ${t.summary}` : ''}`
    );
    return `=== OPEN PLOT THREADS ===\n${lines.join('\n')}`;
  }

  private _worldRulesBlock(): string {
    const { world } = this._managers();
    const rules = world.getGlobalRules();
    if (rules.length === 0) return '';
    const lines = rules.map((r) => `- ${r.title}${r.description ? `: ${r.description}` : ''}`);
    return `=== WORLD RULES ===\n${lines.join('\n')}`;
  }

  private _printFindingsTable(findings: ReviewFinding[], lang: string): void {
    const col1 = 10;
    const col2 = 14;
    const col3 = 14;
    const col4 = 60;
    const sep = `+${'-'.repeat(col1)}+${'-'.repeat(col2)}+${'-'.repeat(col3)}+${'-'.repeat(col4)}+`;
    const cell = (value: string | undefined, width: number): string => {
      let text = value || '';
      if (text.length > width - 2) {
        text = text.substring(0, width - 5) + '...';
      }
      return text.padEnd(width - 2);
    };

    console.log(sep);
    console.log(
      `| ${cell(Locale.get('reviewTableSeverity', lang), col1)} | ${cell(Locale.get('reviewTableKind', lang), col2)} | ${cell(Locale.get('reviewTableWhere', lang), col3)} | ${cell(Locale.get('reviewTableExplanation', lang), col4)} |`
    );
    console.log(sep);
    findings.forEach((finding) => {
      const where = finding.coords || finding.entityId || '';
      console.log(
        `| ${cell(finding.severity, col1)} | ${cell(finding.kind, col2)} | ${cell(where, col3)} | ${cell(finding.explanation, col4)} |`
      );
    });
    console.log(sep);
  }
}
export default ReviewManager;
