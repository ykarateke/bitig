export interface CitationRule {
  term: string;
  replacement: string;
}

export interface CitationCompiledRule {
  term: RegExp;
  replacement: string;
}

export interface SectionTitles {
  [sectionNum: string]: string;
}

export interface BookConfigData {
  title: string;
  subtitle?: string;
  author?: string;
  description?: string;
  assetsDir: string;
  distDir: string;
  outputFilename: string;
  sectionTitles?: SectionTitles;
  theme?: string;
  customThemePath?: string;
  epilogueFile?: string;
  bibliographyFile?: string;
  pdf?: boolean;
  epub?: boolean;
  language?: string;
  citations?: CitationRule[];
  synopses?: Record<string, string>;
  isbn?: string;
  publisher?: string;
  publishDate?: string;
  copyright?: string;
  sectionHeaderStyle?: 'combined' | 'split' | 'title-only' | 'hidden';
  goals?: WritingGoals;
  profile?: string;
}

export interface ChapterGoal {
  min?: number;
  max?: number;
}

export interface WritingGoals {
  totalWords?: number;
  dailyWords?: number;
  perChapter?: Record<string, ChapterGoal>;
}

export interface ProgressLogEntry {
  date: string;
  totalWords: number;
}

export interface ProgressData {
  version: number;
  log: ProgressLogEntry[];
}

export interface SentenceDistribution {
  short: number;
  medium: number;
  long: number;
  longest: number;
}

export interface RepeatedWord {
  word: string;
  count: number;
}

export interface DialogueStats {
  dialogueLines: number;
  narrationLines: number;
  dialogueRatio: number;
}

export interface ReadabilityResult {
  score: number;
  label: string;
  formula: string;
}

export interface ProseAnalysis {
  coords: string | null;
  wordCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  avgSyllablesPerWord: number;
  distribution: SentenceDistribution;
  longSentenceCount: number;
  repeatedWords: RepeatedWord[];
  dialogue: DialogueStats;
  readability: ReadabilityResult;
}

export interface SpecialFiles {
  epilogue?: string;
  bibliography?: string;
}

export interface CaptureOptions {
  page?: number;
  range?: string;
  coords?: string;
  selector?: string;
  outputDir?: string;
  epubChapter?: string; // EPUB chapter capture: "sectionNum.chapterNum" format (e.g. "1.1")
}

export interface MemoryContent {
  feedback: string[];
  style: string[];
  routines: string[];
}

export interface BookMemoryData {
  global: MemoryContent;
  sections: Record<string, MemoryContent>;
  chapters: Record<string, MemoryContent>;
}

export type StoryLayer = 'characters' | 'plot' | 'world';

export interface CharacterArcPoint {
  coords: string;
  state: string;
}

export interface CharacterRelationship {
  characterId: string;
  type?: string;
  description?: string;
}

export interface CharacterPhysical {
  age?: number;
  height?: string;
  hair?: string;
  eyes?: string;
  distinguishingMarks?: string[];
}

export interface CharacterData {
  id: string;
  name: string;
  aliases?: string[];
  role?: string;
  status?: string;
  birthDate?: string | null;
  deathDate?: string | null;
  summary?: string;
  physical?: CharacterPhysical;
  personality?: string[];
  speechStyle?: string;
  goals?: string[];
  arc?: CharacterArcPoint[];
  relationships?: CharacterRelationship[];
  firstAppearance?: string;
  tags?: string[];
  notes?: string;
}

export interface CharactersFileData {
  version: number;
  characters: CharacterData[];
}

export interface PlotThread {
  id: string;
  title: string;
  summary?: string;
  status?: 'open' | 'resolved' | 'abandoned';
  introducedIn?: string;
  resolutionCoords?: string | null;
}

export interface PlotEvent {
  id: string;
  title: string;
  summary?: string;
  type?: 'event' | 'setup' | 'payoff';
  payoffFor?: string | null;
  date?: string;
  order?: number;
  coords?: string[];
  characterIds?: string[];
  placeIds?: string[];
  threadIds?: string[];
  consequences?: string[];
  notes?: string;
}

export interface PlotFileData {
  version: number;
  threads: PlotThread[];
  events: PlotEvent[];
}

export interface WorldEntryBase {
  id: string;
  name: string;
  aliases?: string[];
  description?: string;
  notes?: string;
}

export interface WorldPlace extends WorldEntryBase {
  type?: string;
  parentId?: string | null;
  coords?: string[];
  tags?: string[];
}

export interface WorldOrganization extends WorldEntryBase {
  type?: string;
  memberCharacterIds?: string[];
  placeIds?: string[];
}

export interface WorldSpecies extends WorldEntryBase {
  traits?: string[];
}

export interface WorldTechnology extends WorldEntryBase {
  rules?: string[];
}

export interface WorldRule {
  id: string;
  title: string;
  description?: string;
  scope?: string;
  notes?: string;
}

export interface WorldLoreEntry {
  id: string;
  term: string;
  aliases?: string[];
  definition?: string;
  notes?: string;
}

export interface WorldFileData {
  version: number;
  places: WorldPlace[];
  organizations: WorldOrganization[];
  species: WorldSpecies[];
  technologies: WorldTechnology[];
  rules: WorldRule[];
  lore: WorldLoreEntry[];
}

export type WorldCategory =
  | 'places'
  | 'organizations'
  | 'species'
  | 'technologies'
  | 'rules'
  | 'lore';

export type WorldEntry =
  | WorldPlace
  | WorldOrganization
  | WorldSpecies
  | WorldTechnology
  | WorldRule
  | WorldLoreEntry;
