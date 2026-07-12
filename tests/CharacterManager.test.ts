import * as fs from 'fs';
import { CharacterManager } from '../src/CharacterManager';

jest.mock('fs');

describe('CharacterManager', () => {
  const charactersPath = './assets/characters.json';
  let manager: CharacterManager;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize empty data if file does not exist', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    manager = new CharacterManager(charactersPath);

    expect(manager.data).toEqual({ version: 1, characters: [] });
    expect(manager.exists()).toBe(false);
  });

  it('should load characters from file if it exists', () => {
    const fakeData = {
      version: 1,
      characters: [{ id: 'aylin', name: 'Aylin Demir', role: 'protagonist' }]
    };
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(fakeData));

    manager = new CharacterManager(charactersPath);

    expect(manager.listCharacters()).toHaveLength(1);
    expect(manager.getCharacter('aylin')?.name).toBe('Aylin Demir');
  });

  it('should fallback to empty data and set loadError when parsing fails', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue('invalid-json{');
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    manager = new CharacterManager(charactersPath);

    expect(manager.data).toEqual({ version: 1, characters: [] });
    expect(manager.loadError).not.toBeNull();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should handle empty file content during load', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue('   ');
    manager = new CharacterManager(charactersPath);
    expect(manager.data).toEqual({ version: 1, characters: [] });
  });

  it('should add a character and save', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    manager = new CharacterManager(charactersPath);

    manager.addCharacter({ id: 'aylin', name: 'Aylin Demir', role: 'protagonist' });

    expect(manager.getCharacter('aylin')?.role).toBe('protagonist');
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('should reject duplicate character ids', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    manager = new CharacterManager(charactersPath);

    manager.addCharacter({ id: 'aylin', name: 'Aylin Demir' });
    expect(() => manager.addCharacter({ id: 'aylin', name: 'Another' })).toThrow('already exists');
  });

  it('should reject characters without id or name', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    manager = new CharacterManager(charactersPath);

    expect(() => manager.addCharacter({ id: '', name: 'X' })).toThrow('requires both');
    expect(() => manager.addCharacter({ id: 'x', name: '' })).toThrow('requires both');
  });

  it('should shallow-merge updates, replace arrays, and keep id immutable', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    manager = new CharacterManager(charactersPath);

    manager.addCharacter({ id: 'aylin', name: 'Aylin Demir', personality: ['stubborn'] });
    manager.updateCharacter('aylin', {
      id: 'hacked',
      role: 'antagonist',
      personality: ['loyal']
    } as never);

    const character = manager.getCharacter('aylin');
    expect(character).toBeDefined();
    expect(character?.id).toBe('aylin');
    expect(character?.role).toBe('antagonist');
    expect(character?.personality).toEqual(['loyal']);
  });

  it('should throw when updating or removing a missing character', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    manager = new CharacterManager(charactersPath);

    expect(() => manager.updateCharacter('ghost', { role: 'x' })).toThrow('not found');
    expect(() => manager.removeCharacter('ghost')).toThrow('not found');
  });

  it('should remove a character', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    manager = new CharacterManager(charactersPath);

    manager.addCharacter({ id: 'aylin', name: 'Aylin Demir' });
    manager.removeCharacter('aylin');
    expect(manager.listCharacters()).toHaveLength(0);
  });

  it('should build a locale-aware name index including aliases', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    manager = new CharacterManager(charactersPath);

    manager.addCharacter({ id: 'aylin', name: 'Aylin Demir', aliases: ['Ay', 'Dr. Demir'] });
    manager.addCharacter({ id: 'ipek', name: 'İpek' });

    const index = manager.getNameIndex('tr');
    expect(index.get('aylin demir')).toBe('aylin');
    expect(index.get('ay')).toBe('aylin');
    expect(index.get('dr. demir')).toBe('aylin');
    expect(index.get('ipek')).toBe('ipek');
  });

  it('should write a template on init and refuse to overwrite without force', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    manager = new CharacterManager(charactersPath);
    manager.init();
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(manager.listCharacters().length).toBeGreaterThan(0);

    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(manager.data));
    const existing = new CharacterManager(charactersPath);
    expect(() => existing.init()).toThrow('already exists');
    expect(() => existing.init(true)).not.toThrow();
  });
});
