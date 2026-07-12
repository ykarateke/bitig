import * as fs from 'fs';
import * as path from 'path';
import { CharacterData, CharactersFileData } from './types';

const defaultCharactersData = (): CharactersFileData => ({
  version: 1,
  characters: []
});

export class CharacterManager {
  public charactersPath: string;
  public data: CharactersFileData;
  public loadError: string | null = null;

  constructor(charactersPath: string) {
    this.charactersPath = path.resolve(charactersPath);
    this.data = defaultCharactersData();
    this.loadData();
  }

  public exists(): boolean {
    return fs.existsSync(this.charactersPath);
  }

  /**
   * Loads character data from characters.json, falling back to empty data
   * when the file is missing or corrupt.
   */
  public loadData(): void {
    this.loadError = null;
    if (!fs.existsSync(this.charactersPath)) {
      this.data = defaultCharactersData();
      return;
    }

    try {
      const content = fs.readFileSync(this.charactersPath, 'utf8').trim();
      if (!content) {
        this.data = defaultCharactersData();
        return;
      }
      const parsed = JSON.parse(content) as Partial<CharactersFileData>;
      this.data = {
        version: typeof parsed.version === 'number' ? parsed.version : 1,
        characters: Array.isArray(parsed.characters) ? parsed.characters : []
      };
    } catch (err) {
      this.loadError = (err as Error).message;
      console.warn(
        `Warning: Failed to parse characters file. Initializing empty data. Error: ${this.loadError}`
      );
      this.data = defaultCharactersData();
    }
  }

  /**
   * Writes the current character data back to characters.json.
   */
  public saveData(): void {
    const dir = path.dirname(this.charactersPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.charactersPath, JSON.stringify(this.data, null, 2), 'utf8');
  }

  /**
   * Writes a template characters.json with a single example character.
   */
  public init(force: boolean = false): void {
    if (fs.existsSync(this.charactersPath) && !force) {
      throw new Error(`Characters file already exists at ${this.charactersPath}`);
    }
    this.data = {
      version: 1,
      characters: [
        {
          id: 'ornek-karakter',
          name: 'Örnek Karakter',
          aliases: [],
          role: 'protagonist',
          status: 'alive',
          summary: 'Karakterin tek paragraflık kimlik özeti. Bağlam paketine enjekte edilir.',
          physical: {
            distinguishingMarks: []
          },
          personality: [],
          speechStyle: '',
          goals: [],
          arc: [{ coords: '1.1', state: 'Hikayenin başındaki ruh hali / durumu.' }],
          relationships: [],
          firstAppearance: '1.1',
          tags: [],
          notes: ''
        }
      ]
    };
    this.saveData();
  }

  public addCharacter(data: Partial<CharacterData> & { id: string; name: string }): void {
    if (!data.id || !data.name) {
      throw new Error('Character requires both "id" and "name" fields.');
    }
    if (this.getCharacter(data.id)) {
      throw new Error(`Character with id "${data.id}" already exists.`);
    }
    this.data.characters.push({ ...data });
    this.saveData();
  }

  /**
   * Shallow-merges the patch onto the character; arrays are replaced, id is immutable.
   */
  public updateCharacter(id: string, patch: Partial<CharacterData>): void {
    const character = this.getCharacter(id);
    if (!character) {
      throw new Error(`Character with id "${id}" not found.`);
    }
    Object.assign(character, patch, { id: character.id });
    this.saveData();
  }

  public removeCharacter(id: string): void {
    const idx = this.data.characters.findIndex((c) => c.id === id);
    if (idx === -1) {
      throw new Error(`Character with id "${id}" not found.`);
    }
    this.data.characters.splice(idx, 1);
    this.saveData();
  }

  public getCharacter(id: string): CharacterData | undefined {
    return this.data.characters.find((c) => c.id === id);
  }

  public listCharacters(): CharacterData[] {
    return this.data.characters;
  }

  /**
   * Maps locale-lowercased names and aliases to character ids
   * for text relevance matching and lint checks.
   */
  public getNameIndex(locale: string = 'en'): Map<string, string> {
    const index = new Map<string, string>();
    this.data.characters.forEach((c) => {
      if (c.name) {
        index.set(c.name.toLocaleLowerCase(locale), c.id);
      }
      (c.aliases || []).forEach((alias) => {
        if (alias) {
          index.set(alias.toLocaleLowerCase(locale), c.id);
        }
      });
    });
    return index;
  }
}
export default CharacterManager;
