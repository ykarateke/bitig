import * as fs from 'fs';
import * as path from 'path';
import { CharacterManager } from '../src/CharacterManager';
import { PlotManager } from '../src/PlotManager';
import { WorldManager } from '../src/WorldManager';
import { StoryContextBuilder } from '../src/StoryContextBuilder';

jest.mock('fs');

const setupFiles = (files: Record<string, unknown>): void => {
  (fs.existsSync as jest.Mock).mockImplementation((p: unknown) => {
    return Object.prototype.hasOwnProperty.call(files, path.basename(String(p)));
  });
  (fs.readFileSync as jest.Mock).mockImplementation((p: unknown) => {
    const base = path.basename(String(p));
    if (Object.prototype.hasOwnProperty.call(files, base)) {
      return JSON.stringify(files[base]);
    }
    throw new Error(`Unexpected read: ${base}`);
  });
};

const buildBuilder = (): StoryContextBuilder =>
  new StoryContextBuilder(
    new CharacterManager('./assets/characters.json'),
    new PlotManager('./assets/plot.json'),
    new WorldManager('./assets/world.json')
  );

const baseOptions = {
  sectionNum: 1,
  chapterNum: 2,
  targetText: '',
  precedingText: '',
  precedingCoords: '1.1',
  activeLayers: ['characters', 'plot', 'world'],
  language: 'en'
};

describe('StoryContextBuilder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return an empty string when no story files exist', () => {
    setupFiles({});
    const builder = buildBuilder();
    expect(builder.hasAnyData()).toBe(false);
    expect(builder.buildStoryBlock({ ...baseOptions, targetText: 'Some text' })).toBe('');
  });

  it('should return an empty string when no layers are active', () => {
    setupFiles({
      'characters.json': { version: 1, characters: [{ id: 'aylin', name: 'Aylin' }] }
    });
    const builder = buildBuilder();
    expect(builder.buildStoryBlock({ ...baseOptions, activeLayers: [] })).toBe('');
  });

  it('should render a full card for mentioned characters and a roster for the rest', () => {
    setupFiles({
      'characters.json': {
        version: 1,
        characters: [
          {
            id: 'aylin',
            name: 'Aylin Demir',
            role: 'protagonist',
            summary: 'The lead.',
            speechStyle: 'Short sentences.',
            goals: ['find her brother'],
            personality: ['stubborn'],
            relationships: [{ characterId: 'murat', type: 'brother' }],
            arc: [{ coords: '1.2', state: 'disillusioned' }]
          },
          { id: 'murat', name: 'Murat Demir', role: 'supporting', summary: 'The brother.' }
        ]
      }
    });
    const builder = buildBuilder();
    const block = builder.buildStoryBlock({
      ...baseOptions,
      targetText: 'Aylin Demir walked into the station.'
    });

    expect(block).toContain('## 📖 STORY BIBLE');
    expect(block).toContain('Characters in Scope');
    expect(block).toContain('#### Aylin Demir (`aylin`) — protagonist');
    expect(block).toContain('Speech Style: Short sentences.');
    expect(block).toContain('Character Arc: [1.2] disillusioned');
    expect(block).toContain('Full Cast Roster (Compact)');
    expect(block).toContain('`murat` — Murat Demir (supporting): The brother.');
  });

  it('should not match aliases inside longer words (word boundary)', () => {
    setupFiles({
      'characters.json': {
        version: 1,
        characters: [{ id: 'ay', name: 'Zeynep', aliases: ['Ay'] }]
      }
    });
    const builder = buildBuilder();
    const block = builder.buildStoryBlock({
      ...baseOptions,
      targetText: 'Aylin was here.'
    });

    expect(block).not.toContain('Characters in Scope');
    expect(block).toContain('Full Cast Roster (Compact)');
  });

  it('should match names with Turkish locale lowercasing', () => {
    setupFiles({
      'characters.json': {
        version: 1,
        characters: [{ id: 'ipek', name: 'İpek' }]
      }
    });
    const builder = buildBuilder();
    const block = builder.buildStoryBlock({
      ...baseOptions,
      targetText: 'İpek kapıdan girdi.',
      language: 'tr'
    });

    expect(block).toContain('Kapsamdaki Karakterler');
    expect(block).toContain('#### İpek (`ipek`)');
  });

  it('should pull event-tagged characters into scope and include chronological neighbors', () => {
    setupFiles({
      'characters.json': {
        version: 1,
        characters: [{ id: 'murat', name: 'Murat Demir', summary: 'The brother.' }]
      },
      'plot.json': {
        version: 1,
        threads: [{ id: 't1', title: 'The search', status: 'open', introducedIn: '1.1' }],
        events: [
          { id: 'before', title: 'Before', order: 5 },
          { id: 'crash', title: 'The crash', order: 10, coords: ['1.2'], characterIds: ['murat'] },
          { id: 'after', title: 'After', order: 15 },
          { id: 'far', title: 'Far away', order: 99 }
        ]
      }
    });
    const builder = buildBuilder();
    const block = builder.buildStoryBlock({ ...baseOptions, targetText: 'Empty chapter.' });

    expect(block).toContain('#### Murat Demir (`murat`)');
    expect(block).toContain('Timeline (Relevant Events)');
    expect(block).toContain('[#5] **Before**');
    expect(block).toContain('[#10] **The crash**');
    expect(block).toContain('(👥 murat)');
    expect(block).toContain('[#15] **After**');
    expect(block).not.toContain('Far away');
    expect(block).toContain('Open Plot Threads');
    expect(block).toContain('**The search** (`t1`) | Introduced In: 1.1');
  });

  it('should include mentioned world entries, event places, and always all rules', () => {
    setupFiles({
      'plot.json': {
        version: 1,
        threads: [],
        events: [{ id: 'crash', title: 'The crash', coords: ['1.2'], placeIds: ['haydarpasa'] }]
      },
      'world.json': {
        version: 1,
        places: [
          { id: 'haydarpasa', name: 'Haydarpaşa Station', description: 'Old station.' },
          { id: 'ankara', name: 'Ankara', description: 'Capital.' }
        ],
        organizations: [],
        species: [],
        technologies: [{ id: 'lens', name: 'Echo Lens', description: 'Recorder.' }],
        rules: [{ id: 'r1', title: 'No time travel', description: 'Memory only.' }],
        lore: [{ id: 'bitig', term: 'bitig', definition: 'Old Turkic for book.' }]
      }
    });
    const builder = buildBuilder();
    const block = builder.buildStoryBlock({
      ...baseOptions,
      targetText: 'She remembered the word bitig.'
    });

    expect(block).toContain('World Reference');
    expect(block).toContain('**Haydarpaşa Station** (`haydarpasa`, places): Old station.');
    expect(block).toContain('**bitig** (`bitig`, lore): Old Turkic for book.');
    expect(block).not.toContain('Ankara');
    expect(block).not.toContain('Echo Lens');
    expect(block).toContain('World Rules (Always Obey)');
    expect(block).toContain('**No time travel**: Memory only.');
  });

  it('should respect layer filtering', () => {
    setupFiles({
      'characters.json': {
        version: 1,
        characters: [{ id: 'aylin', name: 'Aylin Demir' }]
      },
      'plot.json': {
        version: 1,
        threads: [{ id: 't1', title: 'Thread', status: 'open' }],
        events: [{ id: 'e1', title: 'Event', coords: ['1.2'] }]
      }
    });
    const builder = buildBuilder();
    const block = builder.buildStoryBlock({
      ...baseOptions,
      targetText: 'Aylin Demir was here.',
      activeLayers: ['characters']
    });

    expect(block).toContain('Characters in Scope');
    expect(block).not.toContain('Timeline (Relevant Events)');
    expect(block).not.toContain('Open Plot Threads');
  });

  it('should select characters by firstAppearance coordinates when the chapter is empty', () => {
    setupFiles({
      'characters.json': {
        version: 1,
        characters: [{ id: 'aylin', name: 'Aylin Demir', firstAppearance: '1.2' }]
      }
    });
    const builder = buildBuilder();
    const block = builder.buildStoryBlock({ ...baseOptions, targetText: '' });

    expect(block).toContain('#### Aylin Demir (`aylin`)');
    expect(block).toContain('First Appearance: 1.2');
  });
});
