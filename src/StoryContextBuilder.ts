import { CharacterManager } from './CharacterManager';
import { PlotManager } from './PlotManager';
import { WorldManager } from './WorldManager';
import { Locale } from './Locale';
import { CharacterData, PlotEvent, WorldCategory, WorldEntry } from './types';

export interface StoryBlockOptions {
  sectionNum: number;
  chapterNum: number;
  targetText: string;
  precedingText: string;
  precedingCoords?: string;
  activeLayers: string[];
  language: string;
}

export class StoryContextBuilder {
  public characters: CharacterManager;
  public plot: PlotManager;
  public world: WorldManager;

  constructor(characters: CharacterManager, plot: PlotManager, world: WorldManager) {
    this.characters = characters;
    this.plot = plot;
    this.world = world;
  }

  public hasAnyData(): boolean {
    return (
      (this.characters.exists() && this.characters.listCharacters().length > 0) ||
      (this.plot.exists() &&
        (this.plot.data.events.length > 0 || this.plot.data.threads.length > 0)) ||
      (this.world.exists() && this.world.listEntries().length > 0)
    );
  }

  /**
   * Tests whether a name/alias occurs in the text as a whole word,
   * using locale-aware lowercasing (safe for Turkish dotted/dotless i).
   */
  public static nameAppearsIn(text: string, name: string, locale: string): boolean {
    if (!text || !name || !name.trim()) return false;
    const lcText = text.toLocaleLowerCase(locale);
    const lcName = name.trim().toLocaleLowerCase(locale);
    const escaped = lcName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'u');
    return re.test(lcText);
  }

  /**
   * Builds the STORY BIBLE markdown block for the given target chapter.
   * Returns an empty string when no relevant story data exists, so projects
   * without story files produce byte-identical context output.
   */
  public buildStoryBlock(opts: StoryBlockOptions): string {
    const layers = (opts.activeLayers || []).map((l) => l.trim().toLowerCase()).filter(Boolean);
    if (layers.length === 0 || !this.hasAnyData()) {
      return '';
    }

    const lang = opts.language;
    const coordsKey = `${opts.sectionNum}.${opts.chapterNum}`;
    const combinedText = `${opts.targetText}\n${opts.precedingText}`;

    const relevantEvents = this._selectRelevantEvents(coordsKey, opts.precedingCoords);
    const sections: string[] = [];

    if (layers.includes('characters')) {
      const block = this._buildCharactersSection(combinedText, coordsKey, relevantEvents, lang);
      if (block) sections.push(block);
    }

    if (layers.includes('plot')) {
      const block = this._buildPlotSection(relevantEvents, lang);
      if (block) sections.push(block);
    }

    if (layers.includes('world')) {
      const block = this._buildWorldSection(combinedText, relevantEvents, lang);
      if (block) sections.push(block);
    }

    if (sections.length === 0) {
      return '';
    }

    const titleText = Locale.get('contextStoryTitle', lang);
    const introText = Locale.get('contextStoryIntro', lang);

    return `\n${titleText}\n=========================\n${introText}\n\n${sections.join('\n\n')}\n\n---\n`;
  }

  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------

  private _selectRelevantEvents(coordsKey: string, precedingCoords?: string): PlotEvent[] {
    if (!this.plot.exists()) return [];
    const chronology = this.plot.getChronology();
    const relevantIdx = new Set<number>();

    chronology.forEach((event, idx) => {
      const coords = event.coords || [];
      if (coords.includes(coordsKey) || (precedingCoords && coords.includes(precedingCoords))) {
        relevantIdx.add(idx);
      }
    });

    // Include chronological neighbors of each directly relevant event for continuity
    const withNeighbors = new Set<number>();
    relevantIdx.forEach((idx) => {
      if (idx > 0) withNeighbors.add(idx - 1);
      withNeighbors.add(idx);
      if (idx < chronology.length - 1) withNeighbors.add(idx + 1);
    });

    return chronology.filter((_, idx) => withNeighbors.has(idx));
  }

  private _buildCharactersSection(
    combinedText: string,
    coordsKey: string,
    relevantEvents: PlotEvent[],
    lang: string
  ): string {
    if (!this.characters.exists()) return '';
    const allCharacters = this.characters.listCharacters();
    if (allCharacters.length === 0) return '';

    const relevantIds = new Set<string>();

    allCharacters.forEach((c) => {
      const names = [c.name, ...(c.aliases || [])];
      if (names.some((n) => StoryContextBuilder.nameAppearsIn(combinedText, n, lang))) {
        relevantIds.add(c.id);
      }
      if (c.firstAppearance === coordsKey) {
        relevantIds.add(c.id);
      }
      if ((c.arc || []).some((point) => point.coords === coordsKey)) {
        relevantIds.add(c.id);
      }
    });

    relevantEvents.forEach((event) => {
      (event.characterIds || []).forEach((id) => {
        if (this.characters.getCharacter(id)) {
          relevantIds.add(id);
        }
      });
    });

    const inScope = allCharacters.filter((c) => relevantIds.has(c.id));
    const roster = allCharacters.filter((c) => !relevantIds.has(c.id));

    const parts: string[] = [];
    if (inScope.length > 0) {
      const header = Locale.get('contextStoryCharactersHeader', lang);
      const cards = inScope.map((c) => this._buildCharacterCard(c, lang)).join('\n\n');
      parts.push(`### ${header}\n${cards}`);
    }
    if (roster.length > 0) {
      const header = Locale.get('contextStoryRosterHeader', lang);
      const lines = roster
        .map((c) => {
          const role = c.role ? ` (${c.role})` : '';
          const summary = c.summary ? `: ${c.summary}` : '';
          return `- \`${c.id}\` — ${c.name}${role}${summary}`;
        })
        .join('\n');
      parts.push(`### ${header}\n${lines}`);
    }

    return parts.join('\n\n');
  }

  private _buildCharacterCard(c: CharacterData, lang: string): string {
    const lines: string[] = [];
    const role = c.role ? ` — ${c.role}` : '';
    lines.push(`#### ${c.name} (\`${c.id}\`)${role}`);

    if (c.summary) {
      lines.push(`- ${Locale.get('contextStorySummaryLabel', lang)}: ${c.summary}`);
    }

    const lifeParts: string[] = [];
    if (c.status) lifeParts.push(`${Locale.get('contextStoryStatusLabel', lang)}: ${c.status}`);
    if (c.birthDate)
      lifeParts.push(`${Locale.get('contextStoryBirthLabel', lang)}: ${c.birthDate}`);
    if (c.deathDate)
      lifeParts.push(`${Locale.get('contextStoryDeathLabel', lang)}: ${c.deathDate}`);
    if (lifeParts.length > 0) {
      lines.push(`- ${lifeParts.join(' | ')}`);
    }

    if (c.physical) {
      const physicalParts = Object.entries(c.physical)
        .filter(([, value]) =>
          Array.isArray(value)
            ? value.length > 0
            : value !== undefined && value !== null && value !== ''
        )
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`);
      if (physicalParts.length > 0) {
        lines.push(
          `- ${Locale.get('contextStoryPhysicalLabel', lang)}: ${physicalParts.join(', ')}`
        );
      }
    }

    if (c.personality && c.personality.length > 0) {
      lines.push(
        `- ${Locale.get('contextStoryPersonalityLabel', lang)}: ${c.personality.join(', ')}`
      );
    }
    if (c.speechStyle) {
      lines.push(`- ${Locale.get('contextStorySpeechLabel', lang)}: ${c.speechStyle}`);
    }
    if (c.goals && c.goals.length > 0) {
      lines.push(`- ${Locale.get('contextStoryGoalsLabel', lang)}: ${c.goals.join('; ')}`);
    }
    if (c.relationships && c.relationships.length > 0) {
      const rels = c.relationships
        .map((r) => {
          const type = r.type ? `${r.type} → ` : '→ ';
          const desc = r.description ? ` (${r.description})` : '';
          return `${type}\`${r.characterId}\`${desc}`;
        })
        .join('; ');
      lines.push(`- ${Locale.get('contextStoryRelationshipsLabel', lang)}: ${rels}`);
    }
    if (c.arc && c.arc.length > 0) {
      const arc = c.arc.map((p) => `[${p.coords}] ${p.state}`).join(' → ');
      lines.push(`- ${Locale.get('contextStoryArcLabel', lang)}: ${arc}`);
    }
    if (c.firstAppearance) {
      lines.push(`- ${Locale.get('contextStoryFirstAppearanceLabel', lang)}: ${c.firstAppearance}`);
    }

    return lines.join('\n');
  }

  private _buildPlotSection(relevantEvents: PlotEvent[], lang: string): string {
    if (!this.plot.exists()) return '';

    const parts: string[] = [];

    if (relevantEvents.length > 0) {
      const header = Locale.get('contextStoryTimelineHeader', lang);
      const lines = relevantEvents.map((e) => this._buildEventLine(e)).join('\n');
      parts.push(`### ${header}\n${lines}`);
    }

    const openThreads = this.plot.getOpenThreads();
    if (openThreads.length > 0) {
      const header = Locale.get('contextStoryThreadsHeader', lang);
      const introducedInLabel = Locale.get('contextStoryIntroducedInLabel', lang);
      const lines = openThreads
        .map((t) => {
          const intro = t.introducedIn ? ` | ${introducedInLabel}: ${t.introducedIn}` : '';
          const summary = t.summary ? ` — ${t.summary}` : '';
          return `- **${t.title}** (\`${t.id}\`)${intro}${summary}`;
        })
        .join('\n');
      parts.push(`### ${header}\n${lines}`);
    }

    return parts.join('\n\n');
  }

  private _buildEventLine(e: PlotEvent): string {
    const markerParts: string[] = [];
    if (typeof e.order === 'number') markerParts.push(`#${e.order}`);
    if (e.date) markerParts.push(e.date);
    const marker = markerParts.length > 0 ? `[${markerParts.join(' | ')}] ` : '';
    const summary = e.summary ? ` — ${e.summary}` : '';
    const chars =
      e.characterIds && e.characterIds.length > 0 ? ` (👥 ${e.characterIds.join(', ')})` : '';
    const places = e.placeIds && e.placeIds.length > 0 ? ` (📍 ${e.placeIds.join(', ')})` : '';
    const coords = e.coords && e.coords.length > 0 ? ` [${e.coords.join(', ')}]` : '';
    return `- ${marker}**${e.title}**${summary}${chars}${places}${coords}`;
  }

  private _buildWorldSection(
    combinedText: string,
    relevantEvents: PlotEvent[],
    lang: string
  ): string {
    if (!this.world.exists()) return '';

    const selected: { category: WorldCategory; entry: WorldEntry }[] = [];
    const selectedIds = new Set<string>();

    const eventPlaceIds = new Set<string>();
    relevantEvents.forEach((e) => (e.placeIds || []).forEach((id) => eventPlaceIds.add(id)));

    this.world.listEntries().forEach(({ category, entry }) => {
      if (category === 'rules') return;
      const key = `${category}:${entry.id}`;
      if (selectedIds.has(key)) return;

      const names = [
        WorldManager.displayNameOf(category, entry),
        ...((entry as { aliases?: string[] }).aliases || [])
      ];
      const mentioned = names.some((n) => StoryContextBuilder.nameAppearsIn(combinedText, n, lang));
      const referenced = category === 'places' && eventPlaceIds.has(entry.id);

      if (mentioned || referenced) {
        selected.push({ category, entry });
        selectedIds.add(key);
      }
    });

    const parts: string[] = [];

    if (selected.length > 0) {
      const header = Locale.get('contextStoryWorldHeader', lang);
      const lines = selected
        .map(({ category, entry }) => {
          const label = WorldManager.displayNameOf(category, entry);
          const description =
            (entry as { description?: string }).description ||
            (entry as { definition?: string }).definition ||
            '';
          const descText = description ? `: ${description}` : '';
          return `- **${label}** (\`${entry.id}\`, ${category})${descText}`;
        })
        .join('\n');
      parts.push(`### ${header}\n${lines}`);
    }

    const rules = this.world.getGlobalRules();
    if (rules.length > 0) {
      const header = Locale.get('contextStoryRulesHeader', lang);
      const lines = rules
        .map((r) => {
          const description = r.description ? `: ${r.description}` : '';
          return `- **${r.title}**${description}`;
        })
        .join('\n');
      parts.push(`### ${header}\n${lines}`);
    }

    return parts.join('\n\n');
  }
}
export default StoryContextBuilder;
