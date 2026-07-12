import * as fs from 'fs';
import { WorldManager } from '../src/WorldManager';

jest.mock('fs');

describe('WorldManager', () => {
  const worldPath = './assets/world.json';
  let manager: WorldManager;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize empty data if file does not exist', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    manager = new WorldManager(worldPath);

    expect(manager.data).toEqual({
      version: 1,
      places: [],
      organizations: [],
      species: [],
      technologies: [],
      rules: [],
      lore: []
    });
  });

  it('should load categories from file, ignoring invalid shapes', () => {
    const fakeData = {
      version: 1,
      places: [{ id: 'ist', name: 'Istanbul' }],
      rules: 'not-an-array'
    };
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(fakeData));

    manager = new WorldManager(worldPath);

    expect(manager.getEntry('places', 'ist')).toBeDefined();
    expect(manager.data.rules).toEqual([]);
  });

  it('should fallback to empty data and set loadError when parsing fails', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue('nope{');
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    manager = new WorldManager(worldPath);

    expect(manager.data.places).toEqual([]);
    expect(manager.loadError).not.toBeNull();
    spy.mockRestore();
  });

  it('should normalize singular/plural/alias category names', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    manager = new WorldManager(worldPath);

    expect(manager.normalizeCategory('place')).toBe('places');
    expect(manager.normalizeCategory('Places')).toBe('places');
    expect(manager.normalizeCategory('org')).toBe('organizations');
    expect(manager.normalizeCategory('race')).toBe('species');
    expect(manager.normalizeCategory('tech')).toBe('technologies');
    expect(manager.normalizeCategory('rule')).toBe('rules');
    expect(manager.normalizeCategory('glossary')).toBe('lore');
    expect(() => manager.normalizeCategory('planet')).toThrow('Unknown world category');
  });

  it('should validate the category-specific label field on add', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    manager = new WorldManager(worldPath);

    expect(() => manager.addEntry('places', { id: 'x' })).toThrow('"name"');
    expect(() => manager.addEntry('rules', { id: 'x' })).toThrow('"title"');
    expect(() => manager.addEntry('lore', { id: 'x' })).toThrow('"term"');

    manager.addEntry('places', { id: 'ist', name: 'Istanbul' } as never);
    manager.addEntry('rules', { id: 'r1', title: 'No time travel' } as never);
    manager.addEntry('lore', { id: 'l1', term: 'bitig' } as never);
    expect(manager.listEntries()).toHaveLength(3);
  });

  it('should reject duplicate ids within a category', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    manager = new WorldManager(worldPath);

    manager.addEntry('places', { id: 'ist', name: 'Istanbul' } as never);
    expect(() => manager.addEntry('places', { id: 'ist', name: 'Other' } as never)).toThrow(
      'already exists'
    );
  });

  it('should update entries with id immutability and remove entries', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    manager = new WorldManager(worldPath);

    manager.addEntry('places', { id: 'ist', name: 'Istanbul' } as never);
    manager.updateEntry('places', 'ist', { id: 'hacked', name: 'İstanbul' } as never);

    const entry = manager.getEntry('places', 'ist');
    expect(entry?.id).toBe('ist');
    expect(WorldManager.displayNameOf('places', entry!)).toBe('İstanbul');

    manager.removeEntry('places', 'ist');
    expect(manager.getEntry('places', 'ist')).toBeUndefined();

    expect(() => manager.updateEntry('places', 'ghost', {})).toThrow('not found');
    expect(() => manager.removeEntry('places', 'ghost')).toThrow('not found');
  });

  it('should list entries per category or across all categories', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    manager = new WorldManager(worldPath);

    manager.addEntry('places', { id: 'ist', name: 'Istanbul' } as never);
    manager.addEntry('technologies', { id: 'lens', name: 'Echo Lens' } as never);

    expect(manager.listEntries('places')).toHaveLength(1);
    expect(manager.listEntries()).toHaveLength(2);
    expect(manager.listEntries()[0].category).toBe('places');
  });

  it('should build a name index excluding rules and return global rules', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    manager = new WorldManager(worldPath);

    manager.addEntry('places', { id: 'ist', name: 'Istanbul', aliases: ['The City'] } as never);
    manager.addEntry('rules', { id: 'r1', title: 'No time travel' } as never);
    manager.addEntry('lore', { id: 'l1', term: 'Bitig' } as never);

    const index = manager.getNameIndex('en');
    expect(index.get('istanbul')).toEqual({ category: 'places', id: 'ist' });
    expect(index.get('the city')).toEqual({ category: 'places', id: 'ist' });
    expect(index.get('bitig')).toEqual({ category: 'lore', id: 'l1' });
    expect(index.get('no time travel')).toBeUndefined();

    expect(manager.getGlobalRules().map((r) => r.id)).toEqual(['r1']);
  });

  it('should write a template on init and refuse to overwrite without force', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    manager = new WorldManager(worldPath);
    manager.init();
    expect(manager.data.places.length).toBeGreaterThan(0);
    expect(manager.data.rules.length).toBeGreaterThan(0);

    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(manager.data));
    const existing = new WorldManager(worldPath);
    expect(() => existing.init()).toThrow('already exists');
    expect(() => existing.init(true)).not.toThrow();
  });
});
