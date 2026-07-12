import * as fs from 'fs';
import * as path from 'path';
import { BookCompiler } from '../src/BookCompiler';
import { CharacterManager } from '../src/CharacterManager';
import { PlotManager } from '../src/PlotManager';
import { WorldManager } from '../src/WorldManager';
import { StoryLinter } from '../src/StoryLinter';

jest.mock('fs');

const setupFiles = (files: Record<string, unknown>): void => {
  (fs.existsSync as jest.Mock).mockImplementation((p: unknown) => {
    return Object.prototype.hasOwnProperty.call(files, path.basename(String(p)));
  });
  (fs.readFileSync as jest.Mock).mockImplementation((p: unknown) => {
    const base = path.basename(String(p));
    const value = files[base];
    if (value !== undefined) {
      return typeof value === 'string' ? value : JSON.stringify(value);
    }
    throw new Error(`Unexpected read: ${base}`);
  });
};

const fakeCompiler = (opts: {
  language?: string;
  publishDate?: string;
  chapters?: Array<{ sec: number; chap: number; content: string }>;
}): BookCompiler => {
  const sectionsMap = new Map<number, { sectionNum: number; chapters: unknown[] }>();
  (opts.chapters || []).forEach((c) => {
    if (!sectionsMap.has(c.sec)) {
      sectionsMap.set(c.sec, { sectionNum: c.sec, chapters: [] });
    }
    sectionsMap.get(c.sec)!.chapters.push({
      sectionNum: c.sec,
      chapterNum: c.chap,
      rawContent: c.content,
      relativePath: `section-${c.sec}/${c.sec}.${c.chap}.md`
    });
  });
  return {
    sections: [...sectionsMap.values()],
    config: { language: opts.language || 'en', rawConfig: { publishDate: opts.publishDate } },
    scanAndLoad: jest.fn()
  } as unknown as BookCompiler;
};

const buildLinter = (compiler: BookCompiler): StoryLinter =>
  new StoryLinter(
    compiler,
    new CharacterManager('./assets/characters.json'),
    new PlotManager('./assets/plot.json'),
    new WorldManager('./assets/world.json')
  );

describe('StoryLinter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should report JSON parse errors as lint errors', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    setupFiles({ 'characters.json': 'broken-json{' });
    const linter = buildLinter(fakeCompiler({ chapters: [{ sec: 1, chap: 1, content: 'Text.' }] }));

    const messages = linter.runAllChecks();
    const parseErrors = messages.filter((m) => m.message.includes('Failed to parse file'));
    expect(parseErrors).toHaveLength(1);
    expect(parseErrors[0].type).toBe('error');
    expect(parseErrors[0].file).toBe('characters.json');
    spy.mockRestore();
  });

  it('should report duplicate ids within a collection', () => {
    setupFiles({
      'characters.json': {
        version: 1,
        characters: [
          { id: 'aylin', name: 'Aylin' },
          { id: 'aylin', name: 'Clone' }
        ]
      }
    });
    const linter = buildLinter(
      fakeCompiler({ chapters: [{ sec: 1, chap: 1, content: 'Aylin.' }] })
    );

    const duplicates = linter.runAllChecks().filter((m) => m.message.includes('Duplicate id'));
    expect(duplicates).toHaveLength(1);
    expect(duplicates[0].type).toBe('error');
  });

  it('should report dangling id references across all files', () => {
    setupFiles({
      'characters.json': {
        version: 1,
        characters: [{ id: 'aylin', name: 'Aylin', relationships: [{ characterId: 'ghost' }] }]
      },
      'plot.json': {
        version: 1,
        threads: [],
        events: [
          {
            id: 'e1',
            title: 'Event',
            characterIds: ['nobody'],
            placeIds: ['nowhere'],
            threadIds: ['no-thread'],
            payoffFor: 'no-setup'
          }
        ]
      },
      'world.json': {
        version: 1,
        places: [{ id: 'ist', name: 'Istanbul', parentId: 'atlantis' }],
        organizations: [{ id: 'org', name: 'The Org', memberCharacterIds: ['phantom'] }],
        species: [],
        technologies: [],
        rules: [],
        lore: []
      }
    });
    const linter = buildLinter(
      fakeCompiler({
        chapters: [{ sec: 1, chap: 1, content: 'Aylin visited Istanbul with The Org.' }]
      })
    );

    const dangling = linter.runAllChecks().filter((m) => m.message.includes('is not defined'));
    const ids = dangling.map((m) => m.message);
    expect(ids.some((m) => m.includes('"ghost"'))).toBe(true);
    expect(ids.some((m) => m.includes('"nobody"'))).toBe(true);
    expect(ids.some((m) => m.includes('"nowhere"'))).toBe(true);
    expect(ids.some((m) => m.includes('"no-thread"'))).toBe(true);
    expect(ids.some((m) => m.includes('"no-setup"'))).toBe(true);
    expect(ids.some((m) => m.includes('"phantom"'))).toBe(true);
    expect(ids.some((m) => m.includes('"atlantis"'))).toBe(true);
    expect(dangling.every((m) => m.type === 'error')).toBe(true);
  });

  it('should warn about coordinates that do not exist in the book', () => {
    setupFiles({
      'plot.json': {
        version: 1,
        threads: [{ id: 't1', title: 'Thread', introducedIn: '9.9' }],
        events: [{ id: 'e1', title: 'Event', coords: ['1.1', '7.7'] }]
      }
    });
    const linter = buildLinter(fakeCompiler({ chapters: [{ sec: 1, chap: 1, content: 'Text.' }] }));

    const unknown = linter
      .runAllChecks()
      .filter((m) => m.message.includes('does not exist in the book'));
    expect(unknown.map((m) => m.message).some((m) => m.includes('7.7'))).toBe(true);
    expect(unknown.map((m) => m.message).some((m) => m.includes('9.9'))).toBe(true);
    expect(unknown.map((m) => m.message).some((m) => m.includes('1.1'))).toBe(false);
  });

  it('should detect timeline conflicts, duplicate orders, and unparseable dates', () => {
    setupFiles({
      'plot.json': {
        version: 1,
        threads: [],
        events: [
          { id: 'first', title: 'First', order: 1, date: '2020-01-01' },
          { id: 'second', title: 'Second', order: 2, date: '2010-01-01' },
          { id: 'dup-a', title: 'Dup A', order: 5 },
          { id: 'dup-b', title: 'Dup B', order: 5 },
          { id: 'fictional', title: 'Fictional', date: 'Third Age 3019' }
        ]
      }
    });
    const linter = buildLinter(fakeCompiler({ chapters: [{ sec: 1, chap: 1, content: 'Text.' }] }));
    const messages = linter.runAllChecks();

    const conflict = messages.filter((m) => m.message.includes('contradicting date and order'));
    expect(conflict).toHaveLength(1);
    expect(conflict[0].type).toBe('error');

    const dupOrder = messages.filter((m) => m.message.includes('used by multiple events'));
    expect(dupOrder).toHaveLength(1);
    expect(dupOrder[0].message).toContain('dup-a, dup-b');

    const unparseable = messages.filter((m) => m.message.includes('unparseable date'));
    expect(unparseable).toHaveLength(1);
    expect(unparseable[0].message).toContain('fictional');
  });

  it('should warn when characters are not born yet or already dead at event dates', () => {
    setupFiles({
      'characters.json': {
        version: 1,
        characters: [
          { id: 'unborn', name: 'Unborn', birthDate: '2015-01-01' },
          { id: 'dead', name: 'Dead', deathDate: '2000-01-01' }
        ]
      },
      'plot.json': {
        version: 1,
        threads: [],
        events: [{ id: 'e1', title: 'Event', date: '2010-06-15', characterIds: ['unborn', 'dead'] }]
      }
    });
    const linter = buildLinter(
      fakeCompiler({ chapters: [{ sec: 1, chap: 1, content: 'Unborn and Dead.' }] })
    );
    const messages = linter.runAllChecks();

    expect(messages.some((m) => m.message.includes('not yet born'))).toBe(true);
    expect(messages.some((m) => m.message.includes('appears to be dead'))).toBe(true);
  });

  it('should warn when physical age contradicts the birth date', () => {
    setupFiles({
      'characters.json': {
        version: 1,
        characters: [{ id: 'aylin', name: 'Aylin', birthDate: '1990-04-12', physical: { age: 50 } }]
      }
    });
    const linter = buildLinter(
      fakeCompiler({
        publishDate: '2024-01-01',
        chapters: [{ sec: 1, chap: 1, content: 'Aylin.' }]
      })
    );

    const mismatch = linter
      .runAllChecks()
      .filter((m) => m.message.includes('contradicts the birth date'));
    expect(mismatch).toHaveLength(1);
    expect(mismatch[0].message).toContain('~34');
  });

  it('should warn about non-reciprocal relationships', () => {
    setupFiles({
      'characters.json': {
        version: 1,
        characters: [
          {
            id: 'aylin',
            name: 'Aylin',
            relationships: [{ characterId: 'murat', type: 'brother' }]
          },
          { id: 'murat', name: 'Murat' }
        ]
      }
    });
    const linter = buildLinter(
      fakeCompiler({ chapters: [{ sec: 1, chap: 1, content: 'Aylin and Murat.' }] })
    );

    const reciprocity = linter
      .runAllChecks()
      .filter((m) => m.message.includes('no reciprocal entry'));
    expect(reciprocity).toHaveLength(1);
    expect(reciprocity[0].message).toContain('"aylin"');
  });

  it('should warn about unused characters and places', () => {
    setupFiles({
      'characters.json': {
        version: 1,
        characters: [
          { id: 'aylin', name: 'Aylin' },
          { id: 'ghost', name: 'Ghostwriter' }
        ]
      },
      'world.json': {
        version: 1,
        places: [
          { id: 'ist', name: 'Istanbul' },
          { id: 'atlantis', name: 'Atlantis' }
        ],
        organizations: [],
        species: [],
        technologies: [],
        rules: [],
        lore: []
      }
    });
    const linter = buildLinter(
      fakeCompiler({ chapters: [{ sec: 1, chap: 1, content: 'Aylin walked through Istanbul.' }] })
    );

    const unused = linter.runAllChecks().filter((m) => m.message.includes('never appears'));
    const texts = unused.map((m) => m.message);
    expect(texts.some((m) => m.includes('"ghost"'))).toBe(true);
    expect(texts.some((m) => m.includes('"atlantis"'))).toBe(true);
    expect(texts.some((m) => m.includes('"aylin"'))).toBe(false);
    expect(texts.some((m) => m.includes('"ist"'))).toBe(false);
  });

  it('should flag frequent capitalized mid-sentence words only with nameScan enabled', () => {
    setupFiles({
      'characters.json': { version: 1, characters: [{ id: 'aylin', name: 'Aylin' }] }
    });
    const content =
      'One day Aylin met Zorlu at the door. She trusted Zorlu completely. Later she saw Zorlu again.';
    const compiler = fakeCompiler({ chapters: [{ sec: 1, chap: 1, content }] });

    const without = buildLinter(compiler)
      .runAllChecks()
      .filter((m) => m.message.includes('Possible unregistered'));
    expect(without).toHaveLength(0);

    const withScan = buildLinter(compiler)
      .runAllChecks({ nameScan: true })
      .filter((m) => m.message.includes('Possible unregistered'));
    expect(withScan).toHaveLength(1);
    expect(withScan[0].message).toContain('"zorlu"');
    expect(withScan[0].message).not.toContain('aylin');
  });

  it('should skip the name scan entirely for German', () => {
    setupFiles({
      'characters.json': { version: 1, characters: [{ id: 'aylin', name: 'Aylin' }] }
    });
    const content = 'Eines Tages traf Aylin den Zorlu. Sie sah Zorlu wieder. Dann kam Zorlu.';
    const linter = buildLinter(
      fakeCompiler({ language: 'de', chapters: [{ sec: 1, chap: 1, content }] })
    );

    const flagged = linter
      .runAllChecks({ nameScan: true })
      .filter((m) => m.message.includes('registrierter'));
    expect(flagged).toHaveLength(0);
  });

  it('should produce no messages for consistent story data', () => {
    setupFiles({
      'characters.json': {
        version: 1,
        characters: [
          {
            id: 'aylin',
            name: 'Aylin',
            birthDate: '1990-04-12',
            relationships: [{ characterId: 'murat', type: 'sister' }]
          },
          {
            id: 'murat',
            name: 'Murat',
            relationships: [{ characterId: 'aylin', type: 'brother' }]
          }
        ]
      },
      'plot.json': {
        version: 1,
        threads: [{ id: 't1', title: 'Thread', status: 'open', introducedIn: '1.1' }],
        events: [
          {
            id: 'e1',
            title: 'Event',
            order: 10,
            date: '2010-08-17',
            coords: ['1.1'],
            characterIds: ['aylin', 'murat'],
            threadIds: ['t1']
          }
        ]
      },
      'world.json': {
        version: 1,
        places: [{ id: 'ist', name: 'Istanbul' }],
        organizations: [],
        species: [],
        technologies: [],
        rules: [{ id: 'r1', title: 'No time travel' }],
        lore: []
      }
    });
    const linter = buildLinter(
      fakeCompiler({ chapters: [{ sec: 1, chap: 1, content: 'Aylin and Murat in Istanbul.' }] })
    );

    expect(linter.runAllChecks()).toEqual([]);
  });
});
