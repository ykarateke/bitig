import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { ReviewManager } from '../src/ReviewManager';
import { BookCompiler } from '../src/BookCompiler';
import { BookConfig } from '../src/BookConfig';
import { Section } from '../src/Section';
import { Chapter } from '../src/Chapter';
import { AgentMetadataGenerator } from '../src/AgentMetadataGenerator';

describe('ReviewManager', () => {
  let tempDir: string;
  let assetsDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bitig-review-'));
    assetsDir = path.join(tempDir, 'assets');
    fs.mkdirSync(assetsDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  const buildManager = (): ReviewManager => {
    const config = new BookConfig({
      title: 'Review Book',
      assetsDir,
      distDir: path.join(tempDir, 'dist'),
      language: 'en'
    });
    const compiler = new BookCompiler(config);
    jest.spyOn(compiler, 'scanAndLoad').mockImplementation(() => {});

    const section = new Section(1, 'S1');
    const chapter1 = new Chapter(path.join(assetsDir, 'section-1/1.1.md'), assetsDir);
    chapter1.title = 'Opening';
    chapter1.rawContent = 'Aylin Demir walked through Haydarpaşa. She said little.';
    const chapter2 = new Chapter(path.join(assetsDir, 'section-1/1.2.md'), assetsDir);
    chapter2.title = 'Second';
    chapter2.rawContent = 'The investigation continued in silence.';
    section.addChapter(chapter1);
    section.addChapter(chapter2);
    compiler.sections = [section];
    compiler.metadataGenerator = new AgentMetadataGenerator(config, compiler.sections);
    return new ReviewManager(compiler);
  };

  const writeStoryFiles = (): void => {
    fs.writeFileSync(
      path.join(assetsDir, 'characters.json'),
      JSON.stringify({
        version: 1,
        characters: [
          {
            id: 'aylin',
            name: 'Aylin Demir',
            role: 'protagonist',
            summary: 'The lead.',
            speechStyle: 'Short sentences.'
          }
        ]
      }),
      'utf8'
    );
    fs.writeFileSync(
      path.join(assetsDir, 'plot.json'),
      JSON.stringify({
        version: 1,
        threads: [{ id: 't-open', title: 'Open thread', status: 'open', introducedIn: '1.1' }],
        events: [
          { id: 'setup-gun', title: 'A gun on the wall', type: 'setup', order: 5, coords: ['1.1'] },
          { id: 'setup-paid', title: 'A promise', type: 'setup', order: 6 },
          {
            id: 'payoff-promise',
            title: 'Promise kept',
            type: 'payoff',
            payoffFor: 'setup-paid',
            order: 20
          }
        ]
      }),
      'utf8'
    );
    fs.writeFileSync(
      path.join(assetsDir, 'world.json'),
      JSON.stringify({
        version: 1,
        places: [{ id: 'haydarpasa', name: 'Haydarpaşa', description: 'Old station.' }],
        organizations: [],
        species: [],
        technologies: [],
        rules: [{ id: 'r1', title: 'No time travel', description: 'Memory only.' }],
        lore: []
      }),
      'utf8'
    );
  };

  it('should normalize review types and reject unknown ones', () => {
    expect(ReviewManager.normalizeType(' Continuity ')).toBe('continuity');
    expect(ReviewManager.normalizeType('PLOTHOLES')).toBe('plotholes');
    expect(() => ReviewManager.normalizeType('grammar')).toThrow('Unknown review type');
  });

  it('should package a continuity review with story bible, chronology, and chapter text', () => {
    writeStoryFiles();
    const context = buildManager().packageContext('continuity', '1.1');

    expect(context).toContain('=== REVIEW TASK: CONTINUITY (1.1) ===');
    expect(context).toContain('=== EXPECTED OUTPUT SCHEMA (JSON) ===');
    expect(context).toContain('"explanation"');
    expect(context).toContain('=== STORY BIBLE (RELEVANT SCOPE) ===');
    expect(context).toContain('Aylin Demir');
    expect(context).toContain('=== FULL EVENT CHRONOLOGY ===');
    expect(context).toContain('setup-gun');
    expect(context).toContain('{payoff of setup-paid}');
    expect(context).toContain('=== CHAPTER CONTENT (1.1 "Opening") ===');
    expect(context).toContain('bitig check');
  });

  it('should package a style review with speech styles and prose metrics', () => {
    writeStoryFiles();
    fs.writeFileSync(
      path.join(tempDir, 'memory.json'),
      JSON.stringify({
        global: { feedback: [], style: ['Prefer short sentences.'], routines: [] },
        sections: {},
        chapters: {}
      }),
      'utf8'
    );

    const context = buildManager().packageContext('style', '1.1');

    expect(context).toContain('=== REVIEW TASK: STYLE (1.1) ===');
    expect(context).toContain('=== RECORDED STYLE MEMORY ===');
    expect(context).toContain('Prefer short sentences.');
    expect(context).toContain('=== CHARACTER SPEECH STYLES ===');
    expect(context).toContain('Short sentences.');
    expect(context).toContain('=== PROSE METRICS (computed locally) ===');
    expect(context).toContain('"wordCount"');
  });

  it('should package a book-wide plothole review with unresolved setups and open threads', () => {
    writeStoryFiles();
    const context = buildManager().packageContext('plotholes', 'all');

    expect(context).toContain('=== REVIEW TASK: PLOTHOLES (WHOLE BOOK) ===');
    expect(context).toContain('=== BOOK STRUCTURE & SYNOPSES ===');
    expect(context).toContain("=== SETUP EVENTS WITHOUT A PAYOFF (Chekhov's guns) ===");
    expect(context).toContain('setup-gun');
    expect(context).not.toMatch(/PAYOFF.*===[\s\S]*setup-paid:/);
    expect(context).toContain('=== OPEN PLOT THREADS ===');
    expect(context).toContain('t-open');
    expect(context).toContain('=== WORLD RULES ===');
    expect(context).not.toContain('=== CHAPTER CONTENT');
  });

  it('should reject "all" for chapter-scoped review types and invalid coordinates', () => {
    const manager = buildManager();
    expect(() => manager.packageContext('continuity', 'all')).toThrow('only supported');
    expect(() => manager.packageContext('style', 'all')).toThrow('only supported');
    expect(() => manager.packageContext('continuity', 'x.y')).toThrow('Invalid coordinates');
    expect(() => manager.packageContext('continuity', '9.9')).toThrow('not found');
  });

  it('should render, log, and validate review findings', () => {
    const manager = buildManager();
    const findingsPath = path.join(tempDir, 'findings.json');
    fs.writeFileSync(
      findingsPath,
      JSON.stringify({
        findings: [
          {
            severity: 'high',
            kind: 'continuity',
            entityId: 'aylin',
            coords: '1.1',
            explanation: 'Aylin knows something she never learned.'
          }
        ],
        summary: 'One contradiction found.'
      }),
      'utf8'
    );

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    manager.reportFindings('continuity', '1.1', findingsPath);
    const output = logSpy.mock.calls.map((call) => call.join(' ')).join('\n');

    expect(output).toContain('REVIEW REPORT — continuity (1.1)');
    expect(output).toContain('Aylin knows something she never learned.');
    expect(output).toContain('Overall Assessment');
    expect(output).toContain('One contradiction found.');

    const logPath = path.join(tempDir, 'diagnostics', 'review_continuity_1.1.json');
    expect(fs.existsSync(logPath)).toBe(true);
    const saved = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    expect(saved.type).toBe('continuity');
    expect(saved.findings).toHaveLength(1);
  });

  it('should print a clean message when there are no findings', () => {
    const manager = buildManager();
    const findingsPath = path.join(tempDir, 'findings.json');
    fs.writeFileSync(findingsPath, JSON.stringify({ findings: [] }), 'utf8');

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    manager.reportFindings('style', '1.1', findingsPath);
    const output = logSpy.mock.calls.map((call) => call.join(' ')).join('\n');

    expect(output).toContain('No findings');
  });

  it('should validate the findings file strictly', () => {
    const manager = buildManager();
    const findingsPath = path.join(tempDir, 'findings.json');

    expect(() => manager.reportFindings('style', '1.1', findingsPath)).toThrow('not found');

    fs.writeFileSync(findingsPath, 'broken{', 'utf8');
    expect(() => manager.reportFindings('style', '1.1', findingsPath)).toThrow('valid JSON');

    fs.writeFileSync(findingsPath, JSON.stringify({ notFindings: [] }), 'utf8');
    expect(() => manager.reportFindings('style', '1.1', findingsPath)).toThrow('"findings" array');

    fs.writeFileSync(findingsPath, JSON.stringify({ findings: [{ severity: 'high' }] }), 'utf8');
    expect(() => manager.reportFindings('style', '1.1', findingsPath)).toThrow('"explanation"');
  });

  it('should push findings into memory.json with --learn (chapter and global scopes)', () => {
    const manager = buildManager();
    const findingsPath = path.join(tempDir, 'findings.json');
    fs.writeFileSync(
      findingsPath,
      JSON.stringify({
        findings: [{ severity: 'medium', explanation: 'Pacing drags in the middle.' }]
      }),
      'utf8'
    );

    jest.spyOn(console, 'log').mockImplementation(() => {});
    manager.reportFindings('style', '1.1', findingsPath, true);

    const memory = JSON.parse(fs.readFileSync(path.join(tempDir, 'memory.json'), 'utf8'));
    expect(memory.chapters['1.1'].feedback).toContain('[review:style] Pacing drags in the middle.');

    manager.reportFindings('plotholes', 'all', findingsPath, true);
    const memoryAfter = JSON.parse(fs.readFileSync(path.join(tempDir, 'memory.json'), 'utf8'));
    expect(memoryAfter.global.feedback).toContain('[review:plotholes] Pacing drags in the middle.');
  });

  it('should work without any story files (empty blocks omitted)', () => {
    const context = buildManager().packageContext('continuity', '1.1');

    expect(context).toContain('=== REVIEW TASK: CONTINUITY (1.1) ===');
    expect(context).not.toContain('=== STORY BIBLE');
    expect(context).not.toContain('=== FULL EVENT CHRONOLOGY ===');
    expect(context).toContain('=== CHAPTER CONTENT (1.1 "Opening") ===');
  });
});
