import { BookCompiler } from './BookCompiler';
import { Chapter } from './Chapter';
import { Locale } from './Locale';
import {
  DialogueStats,
  ProseAnalysis,
  ReadabilityResult,
  RepeatedWord,
  SentenceDistribution
} from './types';

const LONG_SENTENCE_THRESHOLD = 30;
const SHORT_SENTENCE_MAX = 10;
const MEDIUM_SENTENCE_MAX = 25;

// Compact function-word lists used to filter noise out of repeated-word counts.
const STOPWORDS: Record<string, string[]> = {
  tr: [
    'acaba',
    'ama',
    'ancak',
    'artık',
    'aslında',
    'bana',
    'bazı',
    'belki',
    'ben',
    'beni',
    'benim',
    'bile',
    'bir',
    'biraz',
    'birçok',
    'biri',
    'birkaç',
    'birşey',
    'biz',
    'bize',
    'bizi',
    'böyle',
    'bu',
    'buna',
    'bunda',
    'bundan',
    'bunu',
    'bunun',
    'burada',
    'çok',
    'çünkü',
    'da',
    'daha',
    'de',
    'değil',
    'diye',
    'diğer',
    'doğru',
    'eğer',
    'en',
    'gibi',
    'hem',
    'henüz',
    'hep',
    'her',
    'hiç',
    'için',
    'içinde',
    'ile',
    'ise',
    'işte',
    'kadar',
    'kendi',
    'ki',
    'kim',
    'mi',
    'mı',
    'mu',
    'mü',
    'nasıl',
    'ne',
    'neden',
    'nerede',
    'niçin',
    'niye',
    'ona',
    'onu',
    'onun',
    'orada',
    'sana',
    'sen',
    'senin',
    'siz',
    'sonra',
    'şey',
    'şimdi',
    'şu',
    'tüm',
    'var',
    've',
    'veya',
    'ya',
    'yani',
    'yine',
    'yok',
    'zaten'
  ],
  en: [
    'about',
    'after',
    'again',
    'all',
    'also',
    'and',
    'any',
    'are',
    'because',
    'been',
    'before',
    'being',
    'both',
    'but',
    'came',
    'can',
    'come',
    'could',
    'did',
    'does',
    'down',
    'each',
    'even',
    'for',
    'from',
    'get',
    'got',
    'had',
    'has',
    'have',
    'her',
    'here',
    'him',
    'his',
    'how',
    'into',
    'its',
    'just',
    'like',
    'made',
    'more',
    'most',
    'much',
    'not',
    'now',
    'off',
    'once',
    'one',
    'only',
    'other',
    'our',
    'out',
    'over',
    'said',
    'same',
    'she',
    'should',
    'some',
    'such',
    'than',
    'that',
    'the',
    'their',
    'them',
    'then',
    'there',
    'these',
    'they',
    'this',
    'those',
    'through',
    'too',
    'under',
    'very',
    'was',
    'were',
    'what',
    'when',
    'where',
    'which',
    'while',
    'who',
    'why',
    'will',
    'with',
    'would',
    'you',
    'your'
  ],
  de: [
    'aber',
    'alle',
    'als',
    'also',
    'auch',
    'auf',
    'aus',
    'bei',
    'bin',
    'bis',
    'dann',
    'das',
    'dass',
    'dem',
    'den',
    'der',
    'des',
    'die',
    'doch',
    'durch',
    'ein',
    'eine',
    'einem',
    'einen',
    'einer',
    'eines',
    'für',
    'hat',
    'hatte',
    'ich',
    'ihm',
    'ihn',
    'ihr',
    'ihre',
    'im',
    'in',
    'ist',
    'kann',
    'mehr',
    'mit',
    'nach',
    'nicht',
    'noch',
    'nur',
    'oder',
    'schon',
    'sein',
    'seine',
    'sich',
    'sie',
    'sind',
    'so',
    'über',
    'um',
    'und',
    'uns',
    'vom',
    'von',
    'vor',
    'war',
    'wenn',
    'werden',
    'wie',
    'wieder',
    'wir',
    'wird',
    'zu',
    'zum',
    'zur'
  ],
  es: [
    'algo',
    'ante',
    'antes',
    'aquel',
    'aunque',
    'como',
    'con',
    'cual',
    'cuando',
    'del',
    'desde',
    'donde',
    'dos',
    'ella',
    'ellos',
    'entre',
    'era',
    'ese',
    'eso',
    'esta',
    'está',
    'este',
    'esto',
    'fue',
    'hay',
    'las',
    'les',
    'los',
    'más',
    'mientras',
    'muy',
    'nos',
    'otra',
    'otro',
    'para',
    'pero',
    'poco',
    'por',
    'porque',
    'que',
    'qué',
    'ser',
    'sin',
    'sobre',
    'son',
    'su',
    'sus',
    'también',
    'tan',
    'tanto',
    'tenía',
    'tiene',
    'toda',
    'todo',
    'una',
    'uno',
    'unos',
    'usted',
    'vez',
    'era',
    'eran'
  ],
  fr: [
    'ainsi',
    'alors',
    'après',
    'aussi',
    'autre',
    'avait',
    'avant',
    'avec',
    'bien',
    'car',
    'ces',
    'cette',
    'ceux',
    'chez',
    'comme',
    'dans',
    'des',
    'deux',
    'donc',
    'elle',
    'elles',
    'encore',
    'entre',
    'est',
    'était',
    'être',
    'eux',
    'fait',
    'ils',
    'les',
    'leur',
    'lui',
    'mais',
    'même',
    'moins',
    'nous',
    'ont',
    'par',
    'pas',
    'peu',
    'plus',
    'pour',
    'quand',
    'que',
    'qui',
    'sans',
    'ses',
    'son',
    'sont',
    'sous',
    'sur',
    'tout',
    'toute',
    'tous',
    'très',
    'une',
    'vous'
  ]
};

const VOWEL_GROUP_REGEX = /[aeıioöuüâîûéèêëàáíóúùôòìäåæœõãy]+/g;

export class ProseAnalyzer {
  public compiler: BookCompiler;

  constructor(compiler: BookCompiler) {
    this.compiler = compiler;
  }

  /**
   * Analyzes a single chapter by coordinates.
   */
  public analyzeChapter(sectionNum: number, chapterNum: number, topN: number = 20): ProseAnalysis {
    this._ensureLoaded();
    const chapter = this._findChapter(sectionNum, chapterNum);
    if (!chapter) {
      throw new Error(`Target chapter ${sectionNum}.${chapterNum} not found.`);
    }
    return this._analyzeText(chapter.rawContent, `${sectionNum}.${chapterNum}`, topN);
  }

  /**
   * Analyzes the whole manuscript (bibliography section 999 excluded,
   * since reference lists skew prose statistics).
   */
  public analyzeBook(topN: number = 20): ProseAnalysis {
    this._ensureLoaded();
    const texts: string[] = [];
    this.compiler.sections.forEach((section) => {
      if (section.sectionNum === 999) return;
      section.chapters.forEach((chapter) => texts.push(chapter.rawContent));
    });
    return this._analyzeText(texts.join('\n\n'), null, topN);
  }

  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------

  private get lang(): string {
    return this.compiler.config.language;
  }

  private _ensureLoaded(): void {
    if (this.compiler.sections.length === 0) {
      this.compiler.scanAndLoad();
    }
  }

  private _findChapter(sectionNum: number, chapterNum: number): Chapter | null {
    for (const section of this.compiler.sections) {
      for (const chapter of section.chapters) {
        if (chapter.sectionNum === sectionNum && chapter.chapterNum === chapterNum) {
          return chapter;
        }
      }
    }
    return null;
  }

  private _analyzeText(rawText: string, coords: string | null, topN: number): ProseAnalysis {
    const { proseLines, dialogue } = this._classifyLines(rawText);
    const cleanText = this._stripInlineMarkdown(proseLines.join(' '));

    const words = this._tokenizeWords(cleanText);
    const sentences = this._splitSentences(cleanText);

    const wordCount = words.length;
    const sentenceCount = sentences.length;

    const distribution: SentenceDistribution = { short: 0, medium: 0, long: 0, longest: 0 };
    let longSentenceCount = 0;
    sentences.forEach((sentence) => {
      const count = this._tokenizeWords(sentence).length;
      if (count <= SHORT_SENTENCE_MAX) distribution.short++;
      else if (count <= MEDIUM_SENTENCE_MAX) distribution.medium++;
      else distribution.long++;
      if (count > LONG_SENTENCE_THRESHOLD) longSentenceCount++;
      if (count > distribution.longest) distribution.longest = count;
    });

    const totalSyllables = words.reduce((sum, word) => sum + this._countSyllables(word), 0);
    const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    const avgSyllablesPerWord = wordCount > 0 ? totalSyllables / wordCount : 0;

    return {
      coords,
      wordCount,
      sentenceCount,
      avgSentenceLength: Number(avgSentenceLength.toFixed(2)),
      avgSyllablesPerWord: Number(avgSyllablesPerWord.toFixed(2)),
      distribution,
      longSentenceCount,
      repeatedWords: this._countRepeatedWords(words, topN),
      dialogue,
      readability: this._computeReadability(avgSentenceLength, avgSyllablesPerWord, wordCount)
    };
  }

  /**
   * Splits raw markdown into prose lines and dialogue statistics, skipping
   * code blocks and headings. Turkish/French dialogue dashes (— –) and
   * opening quotes mark dialogue lines; markdown list dashes do not.
   */
  private _classifyLines(rawText: string): { proseLines: string[]; dialogue: DialogueStats } {
    const proseLines: string[] = [];
    let dialogueLines = 0;
    let narrationLines = 0;
    let inCodeBlock = false;

    rawText.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        return;
      }
      if (inCodeBlock || trimmed === '' || trimmed.startsWith('#')) {
        return;
      }

      proseLines.push(trimmed);
      if (/^[—–«"“‘']/.test(trimmed)) {
        dialogueLines++;
      } else {
        narrationLines++;
      }
    });

    const total = dialogueLines + narrationLines;
    return {
      proseLines,
      dialogue: {
        dialogueLines,
        narrationLines,
        dialogueRatio: total > 0 ? Number((dialogueLines / total).toFixed(2)) : 0
      }
    };
  }

  private _stripInlineMarkdown(text: string): string {
    return text
      .replace(/!\[.*?\]\(.*?\)/g, ' ')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/`[^`]*`/g, ' ')
      .replace(/[*_~>|]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private _tokenizeWords(text: string): string[] {
    return text.match(/[\p{L}\p{N}’']+/gu) || [];
  }

  private _splitSentences(text: string): string[] {
    return text
      .split(/(?<=[.!?…])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && this._tokenizeWords(s).length > 0);
  }

  private _countSyllables(word: string): number {
    const matches = word.toLocaleLowerCase(this.lang).match(VOWEL_GROUP_REGEX);
    return matches && matches.length > 0 ? matches.length : 1;
  }

  private _countRepeatedWords(words: string[], topN: number): RepeatedWord[] {
    const stopwords = new Set(STOPWORDS[this._normalizedLang()] || STOPWORDS.en);
    const counts = new Map<string, number>();

    words.forEach((word) => {
      const token = word.toLocaleLowerCase(this.lang);
      if (token.length < 3 || /^\d+$/.test(token) || stopwords.has(token)) return;
      counts.set(token, (counts.get(token) || 0) + 1);
    });

    return [...counts.entries()]
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, topN)
      .map(([word, count]) => ({ word, count }));
  }

  /**
   * Language-aware approximate readability on a 0-100 scale (higher = easier):
   * Ateşman (tr), Flesch (en), Amstad (de), Fernández-Huerta (es),
   * Kandel-Moles (fr). Heuristic syllable counting makes this approximate.
   */
  private _computeReadability(
    avgSentenceLength: number,
    avgSyllablesPerWord: number,
    wordCount: number
  ): ReadabilityResult {
    if (wordCount === 0) {
      return { score: 0, label: Locale.get('proseReadabilityNone', this.lang), formula: 'none' };
    }

    const lang = this._normalizedLang();
    let score: number;
    let formula: string;

    switch (lang) {
      case 'tr':
        score = 198.825 - 40.175 * avgSyllablesPerWord - 2.61 * avgSentenceLength;
        formula = 'Ateşman';
        break;
      case 'de':
        score = 180 - avgSentenceLength - 58.5 * avgSyllablesPerWord;
        formula = 'Amstad';
        break;
      case 'es':
        score = 206.84 - 60 * avgSyllablesPerWord - 1.02 * avgSentenceLength;
        formula = 'Fernández-Huerta';
        break;
      case 'fr':
        score = 209 - 1.15 * avgSentenceLength - 68 * avgSyllablesPerWord;
        formula = 'Kandel-Moles';
        break;
      default:
        score = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;
        formula = 'Flesch';
        break;
    }

    score = Math.max(0, Math.min(100, Number(score.toFixed(1))));

    let labelKey = 'proseReadabilityDifficult';
    if (score >= 80) labelKey = 'proseReadabilityVeryEasy';
    else if (score >= 60) labelKey = 'proseReadabilityEasy';
    else if (score >= 40) labelKey = 'proseReadabilityMedium';

    return { score, label: Locale.get(labelKey, this.lang), formula };
  }

  private _normalizedLang(): string {
    const l = this.lang.toLowerCase();
    if (l.startsWith('tr')) return 'tr';
    if (l.startsWith('de')) return 'de';
    if (l.startsWith('es')) return 'es';
    if (l.startsWith('fr')) return 'fr';
    return 'en';
  }
}
export default ProseAnalyzer;
