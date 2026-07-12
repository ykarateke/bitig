import { BookCompiler } from './BookCompiler';
import { Chapter } from './Chapter';
import { LintMessage } from './BookLinter';
import { CharacterManager } from './CharacterManager';
import { PlotManager } from './PlotManager';
import { WorldManager } from './WorldManager';
import { StoryContextBuilder } from './StoryContextBuilder';
import { Locale } from './Locale';
import { PlotEvent } from './types';

const CHARACTERS_FILE = 'characters.json';
const PLOT_FILE = 'plot.json';
const WORLD_FILE = 'world.json';

export class StoryLinter {
  public compiler: BookCompiler;
  public characters: CharacterManager;
  public plot: PlotManager;
  public world: WorldManager;

  constructor(
    compiler: BookCompiler,
    characters: CharacterManager,
    plot: PlotManager,
    world: WorldManager
  ) {
    this.compiler = compiler;
    this.characters = characters;
    this.plot = plot;
    this.world = world;
  }

  /**
   * Runs all story-data consistency checks against the manuscript.
   * The name-scan heuristic is opt-in because it is inherently noisy.
   */
  public runAllChecks(options: { nameScan?: boolean } = {}): LintMessage[] {
    const messages: LintMessage[] = [];

    if (this.compiler.sections.length === 0) {
      this.compiler.scanAndLoad();
    }

    const allChapters: Chapter[] = [];
    this.compiler.sections.forEach((s) => allChapters.push(...s.chapters));

    this._checkParseErrors(messages);
    this._checkDuplicateIds(messages);
    this._checkDanglingReferences(messages);
    this._checkUnknownCoords(messages);
    this._checkTimeline(messages);
    this._checkAgesAndDates(messages);
    this._checkRelationshipReciprocity(messages);
    this._checkUnusedEntities(allChapters, messages);

    if (options.nameScan) {
      this._checkUnregisteredNames(allChapters, messages);
    }

    return messages;
  }

  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------

  private get lang(): string {
    return this.compiler.config.language;
  }

  private _checkParseErrors(messages: LintMessage[]): void {
    const files: [string, string | null][] = [
      [CHARACTERS_FILE, this.characters.loadError],
      [PLOT_FILE, this.plot.loadError],
      [WORLD_FILE, this.world.loadError]
    ];
    files.forEach(([file, loadError]) => {
      if (loadError) {
        messages.push({
          type: 'error',
          file,
          message: Locale.get('storyLinterParseError', this.lang, { error: loadError })
        });
      }
    });
  }

  private _checkDuplicateIds(messages: LintMessage[]): void {
    const report = (file: string, ids: string[]): void => {
      const seen = new Set<string>();
      ids.forEach((id) => {
        if (!id) return;
        if (seen.has(id)) {
          messages.push({
            type: 'error',
            file,
            message: Locale.get('storyLinterDuplicateId', this.lang, { id })
          });
        }
        seen.add(id);
      });
    };

    report(
      CHARACTERS_FILE,
      this.characters.listCharacters().map((c) => c.id)
    );
    report(
      PLOT_FILE,
      this.plot.data.events.map((e) => e.id)
    );
    report(
      PLOT_FILE,
      this.plot.data.threads.map((t) => t.id)
    );
    WorldManager.categories().forEach((category) => {
      report(
        WORLD_FILE,
        this.world.listEntries(category).map(({ entry }) => entry.id)
      );
    });
  }

  private _checkDanglingReferences(messages: LintMessage[]): void {
    const characterIds = new Set(this.characters.listCharacters().map((c) => c.id));
    const threadIds = new Set(this.plot.data.threads.map((t) => t.id));
    const eventIds = new Set(this.plot.data.events.map((e) => e.id));
    const placeIds = new Set(this.world.data.places.map((p) => p.id));

    const report = (file: string, owner: string, refType: string, id: string): void => {
      messages.push({
        type: 'error',
        file,
        message: Locale.get('storyLinterDanglingRef', this.lang, { owner, refType, id })
      });
    };

    this.characters.listCharacters().forEach((c) => {
      (c.relationships || []).forEach((rel) => {
        if (rel.characterId && !characterIds.has(rel.characterId)) {
          report(CHARACTERS_FILE, c.id, 'characterId', rel.characterId);
        }
      });
    });

    this.plot.data.events.forEach((e) => {
      (e.characterIds || []).forEach((id) => {
        if (!characterIds.has(id)) report(PLOT_FILE, e.id, 'characterId', id);
      });
      (e.placeIds || []).forEach((id) => {
        if (!placeIds.has(id)) report(PLOT_FILE, e.id, 'placeId', id);
      });
      (e.threadIds || []).forEach((id) => {
        if (!threadIds.has(id)) report(PLOT_FILE, e.id, 'threadId', id);
      });
      if (e.payoffFor && !eventIds.has(e.payoffFor)) {
        report(PLOT_FILE, e.id, 'payoffFor', e.payoffFor);
      }
    });

    this.world.data.organizations.forEach((org) => {
      (org.memberCharacterIds || []).forEach((id) => {
        if (!characterIds.has(id)) report(WORLD_FILE, org.id, 'characterId', id);
      });
      (org.placeIds || []).forEach((id) => {
        if (!placeIds.has(id)) report(WORLD_FILE, org.id, 'placeId', id);
      });
    });

    this.world.data.places.forEach((place) => {
      if (place.parentId && !placeIds.has(place.parentId)) {
        report(WORLD_FILE, place.id, 'parentId', place.parentId);
      }
    });
  }

  private _checkUnknownCoords(messages: LintMessage[]): void {
    const validCoords = new Set<string>();
    this.compiler.sections.forEach((section) => {
      if (section.sectionNum >= 998) return;
      section.chapters.forEach((chapter) => {
        validCoords.add(`${chapter.sectionNum}.${chapter.chapterNum}`);
      });
    });

    const report = (file: string, owner: string, coords: string): void => {
      messages.push({
        type: 'warning',
        file,
        message: Locale.get('storyLinterUnknownCoords', this.lang, { owner, coords })
      });
    };

    const checkCoords = (file: string, owner: string, coords?: string | null): void => {
      if (coords && !validCoords.has(coords)) {
        report(file, owner, coords);
      }
    };

    this.characters.listCharacters().forEach((c) => {
      checkCoords(CHARACTERS_FILE, c.id, c.firstAppearance);
      (c.arc || []).forEach((point) => checkCoords(CHARACTERS_FILE, c.id, point.coords));
    });

    this.plot.data.events.forEach((e) => {
      (e.coords || []).forEach((coords) => checkCoords(PLOT_FILE, e.id, coords));
    });

    this.plot.data.threads.forEach((t) => {
      checkCoords(PLOT_FILE, t.id, t.introducedIn);
      checkCoords(PLOT_FILE, t.id, t.resolutionCoords);
    });

    this.world.data.places.forEach((place) => {
      (place.coords || []).forEach((coords) => checkCoords(WORLD_FILE, place.id, coords));
    });
  }

  private _checkTimeline(messages: LintMessage[]): void {
    const events = this.plot.data.events;

    // Pairwise date vs order contradiction (only when both fields are comparable)
    const comparable = events.filter(
      (e): e is PlotEvent & { order: number } =>
        typeof e.order === 'number' && PlotManager.parseDate(e.date) !== null
    );
    for (let i = 0; i < comparable.length; i++) {
      for (let j = i + 1; j < comparable.length; j++) {
        const a = comparable[i];
        const b = comparable[j];
        const dateA = PlotManager.parseDate(a.date)!;
        const dateB = PlotManager.parseDate(b.date)!;
        if ((a.order < b.order && dateA > dateB) || (a.order > b.order && dateA < dateB)) {
          messages.push({
            type: 'error',
            file: PLOT_FILE,
            message: Locale.get('storyLinterTimelineConflict', this.lang, {
              idA: a.id,
              idB: b.id
            })
          });
        }
      }
    }

    const byOrder = new Map<number, string[]>();
    events.forEach((e) => {
      if (typeof e.order !== 'number') return;
      const ids = byOrder.get(e.order) || [];
      ids.push(e.id);
      byOrder.set(e.order, ids);
    });
    byOrder.forEach((ids, order) => {
      if (ids.length > 1) {
        messages.push({
          type: 'warning',
          file: PLOT_FILE,
          message: Locale.get('storyLinterDuplicateOrder', this.lang, {
            order,
            ids: ids.join(', ')
          })
        });
      }
    });

    events.forEach((e) => {
      if (
        e.date &&
        e.date.trim() &&
        PlotManager.parseDate(e.date) === null &&
        e.order === undefined
      ) {
        messages.push({
          type: 'warning',
          file: PLOT_FILE,
          message: Locale.get('storyLinterUnparseableDate', this.lang, { id: e.id, date: e.date })
        });
      }
    });
  }

  private _checkAgesAndDates(messages: LintMessage[]): void {
    this.plot.data.events.forEach((e) => {
      const eventDate = PlotManager.parseDate(e.date);
      if (eventDate === null) return;

      (e.characterIds || []).forEach((id) => {
        const character = this.characters.getCharacter(id);
        if (!character) return;

        const birth = PlotManager.parseDate(character.birthDate || undefined);
        if (birth !== null && birth > eventDate) {
          messages.push({
            type: 'warning',
            file: PLOT_FILE,
            message: Locale.get('storyLinterNotBorn', this.lang, {
              character: character.id,
              event: e.id
            })
          });
        }

        const death = PlotManager.parseDate(character.deathDate || undefined);
        if (death !== null && death < eventDate) {
          messages.push({
            type: 'warning',
            file: PLOT_FILE,
            message: Locale.get('storyLinterAlreadyDead', this.lang, {
              character: character.id,
              event: e.id
            })
          });
        }
      });
    });

    const publishDate = PlotManager.parseDate(this.compiler.config.rawConfig.publishDate);
    const referenceYear =
      publishDate !== null ? new Date(publishDate).getFullYear() : new Date().getFullYear();

    this.characters.listCharacters().forEach((c) => {
      const age = c.physical?.age;
      const birth = PlotManager.parseDate(c.birthDate || undefined);
      if (typeof age !== 'number' || birth === null) return;

      const expectedAge = referenceYear - new Date(birth).getFullYear();
      if (Math.abs(expectedAge - age) > 1) {
        messages.push({
          type: 'warning',
          file: CHARACTERS_FILE,
          message: Locale.get('storyLinterAgeMismatch', this.lang, {
            character: c.id,
            age,
            expected: expectedAge
          })
        });
      }
    });
  }

  private _checkRelationshipReciprocity(messages: LintMessage[]): void {
    const characters = this.characters.listCharacters();
    characters.forEach((a) => {
      (a.relationships || []).forEach((rel) => {
        const b = this.characters.getCharacter(rel.characterId);
        if (!b) return;
        const reciprocal = (b.relationships || []).some((r) => r.characterId === a.id);
        if (!reciprocal) {
          messages.push({
            type: 'warning',
            file: CHARACTERS_FILE,
            message: Locale.get('storyLinterNonReciprocal', this.lang, { a: a.id, b: b.id })
          });
        }
      });
    });
  }

  private _checkUnusedEntities(allChapters: Chapter[], messages: LintMessage[]): void {
    const fullText = allChapters.map((c) => c.rawContent).join('\n');

    const referencedCharacterIds = new Set<string>();
    const referencedPlaceIds = new Set<string>();
    this.plot.data.events.forEach((e) => {
      (e.characterIds || []).forEach((id) => referencedCharacterIds.add(id));
      (e.placeIds || []).forEach((id) => referencedPlaceIds.add(id));
    });

    this.characters.listCharacters().forEach((c) => {
      const names = [c.name, ...(c.aliases || [])];
      const mentioned = names.some((n) =>
        StoryContextBuilder.nameAppearsIn(fullText, n, this.lang)
      );
      if (!mentioned && !referencedCharacterIds.has(c.id)) {
        messages.push({
          type: 'warning',
          file: CHARACTERS_FILE,
          message: Locale.get('storyLinterUnusedEntity', this.lang, { id: c.id, name: c.name })
        });
      }
    });

    this.world.data.places.forEach((place) => {
      const names = [place.name, ...(place.aliases || [])];
      const mentioned = names.some((n) =>
        StoryContextBuilder.nameAppearsIn(fullText, n, this.lang)
      );
      if (!mentioned && !referencedPlaceIds.has(place.id)) {
        messages.push({
          type: 'warning',
          file: WORLD_FILE,
          message: Locale.get('storyLinterUnusedEntity', this.lang, {
            id: place.id,
            name: place.name
          })
        });
      }
    });
  }

  /**
   * Heuristic scan for capitalized mid-sentence words that look like
   * unregistered character/place names. Skipped entirely for German,
   * which capitalizes all nouns.
   */
  private _checkUnregisteredNames(allChapters: Chapter[], messages: LintMessage[]): void {
    if (this.lang.toLowerCase().startsWith('de')) return;

    const registeredWords = new Set<string>();
    const addWords = (label: string): void => {
      label
        .toLocaleLowerCase(this.lang)
        .split(/\s+/)
        .filter(Boolean)
        .forEach((word) => registeredWords.add(word));
    };
    this.characters.listCharacters().forEach((c) => {
      addWords(c.name);
      (c.aliases || []).forEach(addWords);
    });
    this.world.listEntries().forEach(({ category, entry }) => {
      addWords(WorldManager.displayNameOf(category, entry));
      ((entry as { aliases?: string[] }).aliases || []).forEach(addWords);
    });

    const counts = new Map<string, { count: number; file: string }>();
    const wordRegex = /[\p{Lu}][\p{L}]+/gu;

    allChapters.forEach((chapter) => {
      chapter.rawContent.split('\n').forEach((line) => {
        if (line.trim().startsWith('#')) return;

        let match;
        wordRegex.lastIndex = 0;
        while ((match = wordRegex.exec(line)) !== null) {
          const before = line.slice(0, match.index).replace(/\s+$/, '');
          // Only mid-sentence occurrences: preceded by a letter/number/comma, not sentence start
          if (!before || !/[\p{L}\p{N},;)]$/u.test(before)) continue;

          const token = match[0].toLocaleLowerCase(this.lang);
          if (registeredWords.has(token)) continue;

          const existing = counts.get(token);
          if (existing) {
            existing.count++;
          } else {
            counts.set(token, { count: 1, file: chapter.relativePath });
          }
        }
      });
    });

    counts.forEach(({ count, file }, token) => {
      if (count >= 3) {
        messages.push({
          type: 'warning',
          file,
          message: Locale.get('storyLinterPossibleUnregistered', this.lang, {
            word: token,
            count
          })
        });
      }
    });
  }
}
export default StoryLinter;
