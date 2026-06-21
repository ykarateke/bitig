import * as fs from 'fs';
import * as path from 'path';
import { BookCompiler } from './BookCompiler';
import { Chapter } from './Chapter';
import { Locale } from './Locale';

export interface QualityGuidelines {
  projectType: string;
  baseScore: number;
  criteria: Record<string, { weight: number; description: string; enabled: boolean }>;
  customRules: string[];
}

export interface DiagnosticResult {
  scores: Record<string, number>; // score out of 100 for each criteria
  feedback: string;
}

export class DiagnosticsManager {
  public compiler: BookCompiler;

  constructor(compiler: BookCompiler) {
    this.compiler = compiler;
  }

  private getGuidelinesPath(): string {
    const projectDir = path.dirname(this.compiler.config.assetsDir);
    return path.join(projectDir, 'quality-guidelines.json');
  }

  public initGuidelines(customTemplatePath?: string): void {
    const guidelinesPath = this.getGuidelinesPath();
    if (fs.existsSync(guidelinesPath)) {
      throw new Error(`Quality guidelines already exist at ${guidelinesPath}`);
    }

    let guidelines: QualityGuidelines;

    if (customTemplatePath) {
      if (!fs.existsSync(customTemplatePath)) {
        throw new Error(`Custom template file not found: ${customTemplatePath}`);
      }
      try {
        const content = fs.readFileSync(customTemplatePath, 'utf8');
        guidelines = JSON.parse(content);
      } catch (e) {
        throw new Error(`Failed to parse custom template file. Must be valid JSON.`);
      }

      // Basic validation
      if (!guidelines.criteria || typeof guidelines.criteria !== 'object') {
        throw new Error(`Invalid guidelines schema: missing or invalid "criteria" object.`);
      }
      for (const [key, val] of Object.entries(guidelines.criteria)) {
        if (
          !val ||
          typeof val !== 'object' ||
          typeof val.weight !== 'number' ||
          typeof val.enabled !== 'boolean'
        ) {
          throw new Error(
            `Invalid criteria definition for "${key}". Must be an object with numeric weight and boolean enabled properties.`
          );
        }
      }
    } else {
      guidelines = {
        projectType: 'general',
        baseScore: 100,
        criteria: {
          AccuracyAndVeracity: {
            weight: 0.25,
            description: 'Bilgilerin doğruluğu ve kaynakların güvenilirliği.',
            enabled: true
          },
          LogicalProgression: {
            weight: 0.15,
            description: 'Fikirlerin veya olay örgüsünün mantıksal bir sırayla ilerlemesi.',
            enabled: true
          },
          Transitions: {
            weight: 0.1,
            description: 'Paragraflar ve bölümler arası geçişlerin akıcılığı.',
            enabled: true
          },
          ReadabilityAndMechanics: {
            weight: 0.1,
            description: 'Dil bilgisi, akıcılık ve cümle yapısı.',
            enabled: true
          },
          CompletenessAndScope: {
            weight: 0.15,
            description: 'Konunun veya olayların yeterince işlenmiş olması, eksik nokta kalmaması.',
            enabled: true
          },
          Consistency: {
            weight: 0.15,
            description: 'Karakterlerin, terimlerin veya üslubun kitap genelinde tutarlı olması.',
            enabled: true
          },
          Intelligibility: {
            weight: 0.1,
            description: 'Hedef kitleye uygun anlaşılırlık seviyesi.',
            enabled: true
          }
        },
        customRules: ['Genel kaliteyi düşürecek tekrarlardan kaçınılmalıdır.']
      };
    }

    fs.writeFileSync(guidelinesPath, JSON.stringify(guidelines, null, 2), 'utf8');
    console.log(`Initialized quality guidelines at: ${guidelinesPath}`);
  }

  public packageContext(sectionNum: number, chapterNum: number): string {
    const guidelinesPath = this.getGuidelinesPath();
    if (!fs.existsSync(guidelinesPath)) {
      throw new Error(`Quality guidelines not found. Run 'bitig analyze:init' first.`);
    }

    const guidelinesContent = fs.readFileSync(guidelinesPath, 'utf8');

    this.compiler.scanAndLoad();
    let targetChapter: Chapter | null = null;
    for (const section of this.compiler.sections) {
      if (section.sectionNum === sectionNum) {
        for (const chap of section.chapters) {
          if (chap.chapterNum === chapterNum) {
            targetChapter = chap;
            break;
          }
        }
      }
    }

    if (!targetChapter) {
      throw new Error(`Target chapter ${sectionNum}.${chapterNum} not found.`);
    }

    return `
=== QUALITY GUIDELINES ===
\`\`\`json
${guidelinesContent}
\`\`\`

=== CHAPTER CONTENT (${sectionNum}.${chapterNum}) ===
\`\`\`markdown
${targetChapter.rawContent}
\`\`\`
`.trim();
  }

  public reportDiagnostics(sectionNum: number, chapterNum: number, tempFilePath: string): void {
    if (!fs.existsSync(tempFilePath)) {
      throw new Error(`Temporary diagnostics file not found: ${tempFilePath}`);
    }

    const guidelinesPath = this.getGuidelinesPath();
    if (!fs.existsSync(guidelinesPath)) {
      throw new Error(`Quality guidelines not found. Run 'bitig analyze:init' first.`);
    }

    const guidelines: QualityGuidelines = JSON.parse(fs.readFileSync(guidelinesPath, 'utf8'));
    const tempContent = fs.readFileSync(tempFilePath, 'utf8');
    let agentResult: DiagnosticResult;
    try {
      agentResult = JSON.parse(tempContent);
    } catch (e) {
      throw new Error(`Failed to parse temporary diagnostics file. Must be valid JSON.`);
    }

    if (!agentResult.scores) {
      throw new Error(`Temporary diagnostics file is missing "scores" object.`);
    }

    let totalScore = 0;
    let maxTotalScore = 0;

    const rows: {
      criteria: string;
      score: number | string;
      weight: number;
      weightedScore: number;
    }[] = [];

    for (const [key, criteriaDef] of Object.entries(guidelines.criteria)) {
      if (!criteriaDef.enabled) continue;

      const rawScore = agentResult.scores[key] ?? 0;
      const weightedScore = rawScore * criteriaDef.weight;

      totalScore += weightedScore;
      maxTotalScore += 100 * criteriaDef.weight;

      rows.push({
        criteria: key,
        score: agentResult.scores[key] !== undefined ? rawScore : 'N/A',
        weight: criteriaDef.weight,
        weightedScore: weightedScore
      });
    }

    const normalizedFinalScore = maxTotalScore > 0 ? (totalScore / maxTotalScore) * 100 : 0;

    // Build ASCII Table
    const col1 = 30; // Criteria
    const col2 = 10; // Raw Score
    const col3 = 10; // Weight
    const col4 = 15; // Weighted Score

    const sep = `+${'-'.repeat(col1)}+${'-'.repeat(col2)}+${'-'.repeat(col3)}+${'-'.repeat(col4)}+`;

    console.log(`\nDiagnostic Report for Chapter ${sectionNum}.${chapterNum}`);
    console.log(sep);
    console.log(
      `| ${'Criteria'.padEnd(col1 - 2)} | ${'Score'.padEnd(col2 - 2)} | ${'Weight'.padEnd(col3 - 2)} | ${'Weighted'.padEnd(col4 - 2)} |`
    );
    console.log(sep);

    for (const row of rows) {
      const cStr =
        row.criteria.length > col1 - 3 ? row.criteria.substring(0, col1 - 5) + '...' : row.criteria;
      const scoreStr = row.score.toString();
      const weightStr = row.weight.toFixed(2);
      const wScoreStr = row.weightedScore.toFixed(2);

      console.log(
        `| ${cStr.padEnd(col1 - 2)} | ${scoreStr.padEnd(col2 - 2)} | ${weightStr.padEnd(col3 - 2)} | ${wScoreStr.padEnd(col4 - 2)} |`
      );
    }
    console.log(sep);
    console.log(
      `| ${'FINAL SCORE'.padEnd(col1 - 2)} | ${''.padEnd(col2 - 2)} | ${''.padEnd(col3 - 2)} | ${normalizedFinalScore.toFixed(2).padEnd(col4 - 2)} |`
    );
    console.log(sep);

    if (agentResult.feedback) {
      console.log(`\nFeedback:\n${agentResult.feedback}\n`);
    }

    const projectDir = path.dirname(this.compiler.config.assetsDir);
    const diagnosticsDir = path.join(projectDir, 'diagnostics');
    if (!fs.existsSync(diagnosticsDir)) {
      fs.mkdirSync(diagnosticsDir, { recursive: true });
    }

    const logPath = path.join(diagnosticsDir, `diagnostic_${sectionNum}.${chapterNum}.json`);
    const finalReport = {
      timestamp: new Date().toISOString(),
      chapter: `${sectionNum}.${chapterNum}`,
      projectType: guidelines.projectType,
      scores: agentResult.scores,
      finalScore: Number(normalizedFinalScore.toFixed(2)),
      feedback: agentResult.feedback,
      weightsUsed: Object.fromEntries(
        Object.entries(guidelines.criteria)
          .filter(([_, def]) => def.enabled)
          .map(([k, def]) => [k, def.weight])
      )
    };

    fs.writeFileSync(logPath, JSON.stringify(finalReport, null, 2), 'utf8');
    console.log(`Diagnostic report saved to: ${logPath}`);
  }
}
