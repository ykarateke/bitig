import { ProseAnalyzer } from '../src/ProseAnalyzer';
import { BookCompiler } from '../src/BookCompiler';
import { BookConfig } from '../src/BookConfig';
import { Section } from '../src/Section';
import { Chapter } from '../src/Chapter';

const buildCompiler = (
  chapters: Array<{ sec: number; chap: number; content: string }>,
  language: string = 'en'
): BookCompiler => {
  const config = new BookConfig({
    title: 'Prose Book',
    assetsDir: './assets',
    distDir: './dist',
    language
  });
  const compiler = new BookCompiler(config);
  jest.spyOn(compiler, 'scanAndLoad').mockImplementation(() => {});

  const sections = new Map<number, Section>();
  chapters.forEach(({ sec, chap, content }) => {
    if (!sections.has(sec)) {
      sections.set(sec, new Section(sec, `Section ${sec}`));
    }
    const chapter = new Chapter(`assets/section-${sec}/${sec}.${chap}.md`, './assets');
    chapter.rawContent = content;
    chapter.title = `Chapter ${sec}.${chap}`;
    sections.get(sec)!.addChapter(chapter);
  });
  compiler.sections = [...sections.values()];
  return compiler;
};

describe('ProseAnalyzer', () => {
  it('should compute word, sentence, and distribution stats for a chapter', () => {
    const content = [
      '# Title Ignored',
      '',
      'The dragon flew. The dragon landed on the tower and watched the valley below with patience.',
      'Short one.'
    ].join('\n');
    const analyzer = new ProseAnalyzer(buildCompiler([{ sec: 1, chap: 1, content }]));

    const analysis = analyzer.analyzeChapter(1, 1);

    expect(analysis.coords).toBe('1.1');
    expect(analysis.sentenceCount).toBe(3);
    expect(analysis.wordCount).toBe(18);
    expect(analysis.distribution.short).toBe(2);
    expect(analysis.distribution.medium).toBe(1);
    expect(analysis.distribution.long).toBe(0);
    expect(analysis.distribution.longest).toBe(13);
    expect(analysis.longSentenceCount).toBe(0);
    expect(analysis.avgSentenceLength).toBeCloseTo(18 / 3, 1);
  });

  it('should count repeated words excluding stopwords and respect topN', () => {
    const content =
      'The dragon saw the dragon. A dragon is a dragon. The castle stood near the castle gate. Castle walls crumbled.';
    const analyzer = new ProseAnalyzer(buildCompiler([{ sec: 1, chap: 1, content }]));

    const analysis = analyzer.analyzeChapter(1, 1);
    const words = analysis.repeatedWords.map((r) => r.word);

    expect(words[0]).toBe('dragon');
    expect(analysis.repeatedWords[0].count).toBe(4);
    expect(words).toContain('castle');
    expect(words).not.toContain('the');

    const limited = analyzer.analyzeChapter(1, 1, 1);
    expect(limited.repeatedWords).toHaveLength(1);
  });

  it('should exclude Turkish stopwords and use the Ateşman formula for Turkish', () => {
    const content =
      'Ejderha ve kule bir masal gibi duruyordu. Ejderha çok yükseldi ve kule göründü. Ejderha sonunda indi.';
    const analyzer = new ProseAnalyzer(buildCompiler([{ sec: 1, chap: 1, content }], 'tr'));

    const analysis = analyzer.analyzeChapter(1, 1);
    const words = analysis.repeatedWords.map((r) => r.word);

    expect(words).toContain('ejderha');
    expect(words).toContain('kule');
    expect(words).not.toContain('ve');
    expect(words).not.toContain('bir');
    expect(analysis.readability.formula).toBe('Ateşman');
    expect(analysis.readability.score).toBeGreaterThanOrEqual(0);
    expect(analysis.readability.score).toBeLessThanOrEqual(100);
  });

  it('should pick the language-specific readability formula', () => {
    const content = 'Simple words make simple sentences. Reading is easy here.';
    const formulaByLang: Record<string, string> = {
      en: 'Flesch',
      de: 'Amstad',
      es: 'Fernández-Huerta',
      fr: 'Kandel-Moles'
    };

    Object.entries(formulaByLang).forEach(([lang, formula]) => {
      const analyzer = new ProseAnalyzer(buildCompiler([{ sec: 1, chap: 1, content }], lang));
      expect(analyzer.analyzeChapter(1, 1).readability.formula).toBe(formula);
    });
  });

  it('should detect dialogue lines by dash and quote markers, not markdown lists', () => {
    const content = [
      '— Nereye gidiyorsun? diye sordu.',
      'Aylin durdu ve arkasına baktı.',
      '“Bilmiyorum,” dedi.',
      '- bu bir liste maddesi',
      'Sessizlik uzun sürdü.'
    ].join('\n');
    const analyzer = new ProseAnalyzer(buildCompiler([{ sec: 1, chap: 1, content }], 'tr'));

    const analysis = analyzer.analyzeChapter(1, 1);

    expect(analysis.dialogue.dialogueLines).toBe(2);
    expect(analysis.dialogue.narrationLines).toBe(3);
    expect(analysis.dialogue.dialogueRatio).toBeCloseTo(0.4, 2);
  });

  it('should skip code blocks and headings, strip links and images', () => {
    const content = [
      '# Heading',
      '```js',
      'const ignored = "totally ignored code words";',
      '```',
      'Visit [the castle](https://example.com) today.',
      '![map](map.png)'
    ].join('\n');
    const analyzer = new ProseAnalyzer(buildCompiler([{ sec: 1, chap: 1, content }]));

    const analysis = analyzer.analyzeChapter(1, 1);

    expect(analysis.wordCount).toBe(4);
    expect(analysis.sentenceCount).toBe(1);
    expect(analysis.repeatedWords.map((r) => r.word)).not.toContain('ignored');
  });

  it('should analyze the whole book while excluding the bibliography section', () => {
    const analyzer = new ProseAnalyzer(
      buildCompiler([
        { sec: 1, chap: 1, content: 'First chapter text here.' },
        { sec: 2, chap: 1, content: 'Second chapter text here.' },
        { sec: 999, chap: 1, content: 'Reference entries that must not count.' }
      ])
    );

    const analysis = analyzer.analyzeBook();

    expect(analysis.coords).toBeNull();
    expect(analysis.wordCount).toBe(8);
  });

  it('should handle empty chapters gracefully', () => {
    const analyzer = new ProseAnalyzer(buildCompiler([{ sec: 1, chap: 1, content: '' }]));

    const analysis = analyzer.analyzeChapter(1, 1);

    expect(analysis.wordCount).toBe(0);
    expect(analysis.sentenceCount).toBe(0);
    expect(analysis.readability.formula).toBe('none');
    expect(analysis.readability.score).toBe(0);
    expect(analysis.dialogue.dialogueRatio).toBe(0);
  });

  it('should throw for a missing chapter', () => {
    const analyzer = new ProseAnalyzer(buildCompiler([{ sec: 1, chap: 1, content: 'Text.' }]));
    expect(() => analyzer.analyzeChapter(9, 9)).toThrow('not found');
  });

  it('should flag very long sentences', () => {
    const longSentence = `${Array.from({ length: 35 }, (_, i) => `word${i}`).join(' ')}.`;
    const analyzer = new ProseAnalyzer(
      buildCompiler([{ sec: 1, chap: 1, content: `${longSentence} Short one.` }])
    );

    const analysis = analyzer.analyzeChapter(1, 1);

    expect(analysis.longSentenceCount).toBe(1);
    expect(analysis.distribution.long).toBe(1);
    expect(analysis.distribution.longest).toBe(35);
  });
});
