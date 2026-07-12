import * as fs from 'fs';
import * as path from 'path';
import { WorldCategory, WorldEntry, WorldFileData, WorldRule } from './types';

const WORLD_CATEGORIES: WorldCategory[] = [
  'places',
  'organizations',
  'species',
  'technologies',
  'rules',
  'lore'
];

const CATEGORY_ALIASES: Record<string, WorldCategory> = {
  place: 'places',
  places: 'places',
  organization: 'organizations',
  organizations: 'organizations',
  org: 'organizations',
  species: 'species',
  race: 'species',
  races: 'species',
  technology: 'technologies',
  technologies: 'technologies',
  tech: 'technologies',
  rule: 'rules',
  rules: 'rules',
  lore: 'lore',
  glossary: 'lore'
};

const defaultWorldData = (): WorldFileData => ({
  version: 1,
  places: [],
  organizations: [],
  species: [],
  technologies: [],
  rules: [],
  lore: []
});

export class WorldManager {
  public worldPath: string;
  public data: WorldFileData;
  public loadError: string | null = null;

  constructor(worldPath: string) {
    this.worldPath = path.resolve(worldPath);
    this.data = defaultWorldData();
    this.loadData();
  }

  public exists(): boolean {
    return fs.existsSync(this.worldPath);
  }

  /**
   * Loads world data from world.json, falling back to empty data
   * when the file is missing or corrupt.
   */
  public loadData(): void {
    this.loadError = null;
    if (!fs.existsSync(this.worldPath)) {
      this.data = defaultWorldData();
      return;
    }

    try {
      const content = fs.readFileSync(this.worldPath, 'utf8').trim();
      if (!content) {
        this.data = defaultWorldData();
        return;
      }
      const parsed = JSON.parse(content) as Partial<WorldFileData>;
      const data = defaultWorldData();
      data.version = typeof parsed.version === 'number' ? parsed.version : 1;
      WORLD_CATEGORIES.forEach((category) => {
        const value = (parsed as Record<string, unknown>)[category];
        if (Array.isArray(value)) {
          (data as unknown as Record<string, unknown[]>)[category] = value;
        }
      });
      this.data = data;
    } catch (err) {
      this.loadError = (err as Error).message;
      console.warn(
        `Warning: Failed to parse world file. Initializing empty data. Error: ${this.loadError}`
      );
      this.data = defaultWorldData();
    }
  }

  /**
   * Writes the current world data back to world.json.
   */
  public saveData(): void {
    const dir = path.dirname(this.worldPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.worldPath, JSON.stringify(this.data, null, 2), 'utf8');
  }

  /**
   * Writes a template world.json with a single example place and rule.
   */
  public init(force: boolean = false): void {
    if (fs.existsSync(this.worldPath) && !force) {
      throw new Error(`World file already exists at ${this.worldPath}`);
    }
    this.data = {
      version: 1,
      places: [
        {
          id: 'ornek-mekan',
          name: 'Örnek Mekan',
          aliases: [],
          type: 'city',
          parentId: null,
          description: 'Hikayenin geçtiği önemli bir mekan.',
          coords: ['1.1'],
          tags: [],
          notes: ''
        }
      ],
      organizations: [],
      species: [],
      technologies: [],
      rules: [
        {
          id: 'ornek-kural',
          title: 'Örnek dünya kuralı',
          description: 'Hikaye dünyasında her zaman geçerli olan bir kural veya kısıt.',
          scope: 'global',
          notes: ''
        }
      ],
      lore: []
    };
    this.saveData();
  }

  /**
   * Normalizes a user-supplied category name (singular or plural) to the
   * canonical plural key, throwing on unknown categories.
   */
  public normalizeCategory(input: string): WorldCategory {
    const cleaned = input.trim().toLowerCase();
    const category = CATEGORY_ALIASES[cleaned];
    if (!category) {
      throw new Error(
        `Unknown world category: "${input}". Supported: place, organization, species, technology, rule, lore`
      );
    }
    return category;
  }

  public addEntry(category: WorldCategory, data: Partial<WorldEntry> & { id: string }): void {
    if (!data.id) {
      throw new Error('World entry requires an "id" field.');
    }
    const labelField = WorldManager.labelFieldOf(category);
    if (!(data as Record<string, unknown>)[labelField]) {
      throw new Error(`World entry in "${category}" requires a "${labelField}" field.`);
    }
    if (this.getEntry(category, data.id)) {
      throw new Error(`World entry with id "${data.id}" already exists in "${category}".`);
    }
    (this.data[category] as WorldEntry[]).push({ ...data } as WorldEntry);
    this.saveData();
  }

  /**
   * Shallow-merges the patch onto the entry; arrays are replaced, id is immutable.
   */
  public updateEntry(category: WorldCategory, id: string, patch: Partial<WorldEntry>): void {
    const entry = this.getEntry(category, id);
    if (!entry) {
      throw new Error(`World entry with id "${id}" not found in "${category}".`);
    }
    Object.assign(entry, patch, { id: entry.id });
    this.saveData();
  }

  public removeEntry(category: WorldCategory, id: string): void {
    const entries = this.data[category] as WorldEntry[];
    const idx = entries.findIndex((e) => e.id === id);
    if (idx === -1) {
      throw new Error(`World entry with id "${id}" not found in "${category}".`);
    }
    entries.splice(idx, 1);
    this.saveData();
  }

  public getEntry(category: WorldCategory, id: string): WorldEntry | undefined {
    return (this.data[category] as WorldEntry[]).find((e) => e.id === id);
  }

  public listEntries(category?: WorldCategory): { category: WorldCategory; entry: WorldEntry }[] {
    const categories = category ? [category] : WORLD_CATEGORIES;
    const result: { category: WorldCategory; entry: WorldEntry }[] = [];
    categories.forEach((cat) => {
      (this.data[cat] as WorldEntry[]).forEach((entry) => result.push({ category: cat, entry }));
    });
    return result;
  }

  /**
   * World rules are standing constraints, always injected into context.
   */
  public getGlobalRules(): WorldRule[] {
    return this.data.rules;
  }

  /**
   * Maps locale-lowercased names/terms and aliases to their entry, for text
   * relevance matching and lint checks. Rules are excluded (always injected).
   */
  public getNameIndex(locale: string = 'en'): Map<string, { category: WorldCategory; id: string }> {
    const index = new Map<string, { category: WorldCategory; id: string }>();
    WORLD_CATEGORIES.forEach((category) => {
      if (category === 'rules') return;
      (this.data[category] as WorldEntry[]).forEach((entry) => {
        const label = WorldManager.displayNameOf(category, entry);
        if (label) {
          index.set(label.toLocaleLowerCase(locale), { category, id: entry.id });
        }
        const aliases = (entry as { aliases?: string[] }).aliases || [];
        aliases.forEach((alias) => {
          if (alias) {
            index.set(alias.toLocaleLowerCase(locale), { category, id: entry.id });
          }
        });
      });
    });
    return index;
  }

  public static labelFieldOf(category: WorldCategory): 'name' | 'title' | 'term' {
    if (category === 'rules') return 'title';
    if (category === 'lore') return 'term';
    return 'name';
  }

  public static displayNameOf(category: WorldCategory, entry: WorldEntry): string {
    const field = WorldManager.labelFieldOf(category);
    return ((entry as unknown as Record<string, unknown>)[field] as string) || '';
  }

  public static categories(): WorldCategory[] {
    return [...WORLD_CATEGORIES];
  }
}
export default WorldManager;
