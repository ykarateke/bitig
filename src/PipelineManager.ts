import * as fs from 'fs';
import * as path from 'path';

export interface PipelineRole {
  id: string;
  title: string;
  description: string;
  contextCommand: string;
  reportCommand: string;
  artifact: string;
}

export interface PipelineData {
  version: number;
  roles: PipelineRole[];
}

export interface PipelineRoleStatus {
  role: PipelineRole;
  done: boolean;
}

const defaultPipelineData = (): PipelineData => ({
  version: 1,
  roles: [
    {
      id: 'chapter-review',
      title: 'Chapter Review Agent',
      description: 'Scores overall chapter quality against the rubrics in quality-guidelines.json.',
      contextCommand: 'bitig analyze:context {coords}',
      reportCommand: 'bitig analyze:report {coords} --file <evaluation.json>',
      artifact: 'diagnostic_{coords}.json'
    },
    {
      id: 'continuity',
      title: 'Continuity Agent',
      description:
        'Checks the chapter against the story bible: character traits, timeline, world rules.',
      contextCommand: 'bitig review:context {coords} --type continuity',
      reportCommand:
        'bitig review:report {coords} --type continuity --file <findings.json> --learn',
      artifact: 'review_continuity_{coords}.json'
    },
    {
      id: 'style',
      title: 'Style Agent',
      description:
        'Evaluates voice consistency against recorded style memory, speech styles, and prose metrics.',
      contextCommand: 'bitig review:context {coords} --type style',
      reportCommand: 'bitig review:report {coords} --type style --file <findings.json> --learn',
      artifact: 'review_style_{coords}.json'
    },
    {
      id: 'proofreader',
      title: 'Proofreader Agent',
      description:
        'Runs the mechanical pass: bitig check --story-names plus bitig analyze:prose {coords} --json, then fixes typos, punctuation, and markdown issues directly in the chapter file.',
      contextCommand: 'bitig analyze:prose {coords} --json',
      reportCommand: 'bitig pipeline:done proofreader {coords} [--file <notes.json>]',
      artifact: 'pipeline_proofreader_{coords}.json'
    },
    {
      id: 'fact-checker',
      title: 'Fact Checker Agent',
      description:
        'Verifies factual claims and citation usage using the full context pack (citation rules included).',
      contextCommand: 'bitig context {coords}',
      reportCommand: 'bitig pipeline:done fact-checker {coords} [--file <notes.json>]',
      artifact: 'pipeline_fact-checker_{coords}.json'
    },
    {
      id: 'final-editor',
      title: 'Final Editor Agent',
      description:
        'Reads every report under diagnostics/ for this chapter, applies accepted fixes, and updates the synopsis via bitig update:metadata.',
      contextCommand: 'bitig pipeline:status {coords}',
      reportCommand: 'bitig pipeline:done final-editor {coords} [--file <notes.json>]',
      artifact: 'pipeline_final-editor_{coords}.json'
    }
  ]
});

export class PipelineManager {
  public pipelinePath: string;
  public diagnosticsDir: string;
  public data: PipelineData;

  constructor(projectDir: string) {
    this.pipelinePath = path.resolve(projectDir, 'pipeline.json');
    this.diagnosticsDir = path.resolve(projectDir, 'diagnostics');
    this.data = defaultPipelineData();
    this.loadData();
  }

  public exists(): boolean {
    return fs.existsSync(this.pipelinePath);
  }

  /**
   * Loads pipeline.json, falling back to the default six-role pipeline when
   * the file is missing or corrupt. Roles are user-editable.
   */
  public loadData(): void {
    if (!fs.existsSync(this.pipelinePath)) {
      this.data = defaultPipelineData();
      return;
    }

    try {
      const content = fs.readFileSync(this.pipelinePath, 'utf8').trim();
      if (!content) {
        this.data = defaultPipelineData();
        return;
      }
      const parsed = JSON.parse(content) as Partial<PipelineData>;
      const roles = Array.isArray(parsed.roles)
        ? parsed.roles.filter(
            (role): role is PipelineRole =>
              !!role && typeof role.id === 'string' && typeof role.artifact === 'string'
          )
        : [];
      this.data = {
        version: typeof parsed.version === 'number' ? parsed.version : 1,
        roles: roles.length > 0 ? roles : defaultPipelineData().roles
      };
    } catch (err) {
      console.warn(
        `Warning: Failed to parse pipeline file. Using the default pipeline. Error: ${(err as Error).message}`
      );
      this.data = defaultPipelineData();
    }
  }

  /**
   * Writes the default pipeline.json template.
   */
  public init(force: boolean = false): void {
    if (fs.existsSync(this.pipelinePath) && !force) {
      throw new Error(`Pipeline file already exists at ${this.pipelinePath}`);
    }
    this.data = defaultPipelineData();
    fs.writeFileSync(this.pipelinePath, JSON.stringify(this.data, null, 2), 'utf8');
  }

  public getRoles(): PipelineRole[] {
    return this.data.roles;
  }

  public getRole(roleId: string): PipelineRole | undefined {
    return this.data.roles.find((role) => role.id === roleId);
  }

  /**
   * A role is complete for a chapter when its artifact exists under
   * diagnostics/ (artifact patterns use the {coords} placeholder).
   */
  public isRoleComplete(role: PipelineRole, coords: string): boolean {
    return fs.existsSync(this.artifactPathFor(role, coords));
  }

  public artifactPathFor(role: PipelineRole, coords: string): string {
    return path.join(this.diagnosticsDir, role.artifact.split('{coords}').join(coords));
  }

  public getStatus(coords: string): PipelineRoleStatus[] {
    return this.data.roles.map((role) => ({
      role,
      done: this.isRoleComplete(role, coords)
    }));
  }

  /**
   * Returns the first incomplete role for the chapter — the "conveyor belt"
   * an external orchestrator loops over — or null when all roles are done.
   */
  public getNextRole(coords: string): PipelineRole | null {
    for (const role of this.data.roles) {
      if (!this.isRoleComplete(role, coords)) {
        return role;
      }
    }
    return null;
  }

  /**
   * Marks a role complete by writing its pipeline artifact under diagnostics/.
   * Intended for roles without a natural report file (proofreader,
   * fact-checker, final-editor); `notes` may carry the agent's summary.
   */
  public markDone(roleId: string, coords: string, notesFilePath?: string): string {
    const role = this.getRole(roleId);
    if (!role) {
      const known = this.data.roles.map((r) => r.id).join(', ');
      throw new Error(`Unknown pipeline role: "${roleId}". Known roles: ${known}`);
    }

    let notes: unknown = null;
    if (notesFilePath) {
      const resolved = path.resolve(notesFilePath);
      if (!fs.existsSync(resolved)) {
        throw new Error(`Notes file not found: ${resolved}`);
      }
      try {
        notes = JSON.parse(fs.readFileSync(resolved, 'utf8'));
      } catch (e) {
        throw new Error('Failed to parse notes file. Must be valid JSON.');
      }
    }

    if (!fs.existsSync(this.diagnosticsDir)) {
      fs.mkdirSync(this.diagnosticsDir, { recursive: true });
    }
    const artifactPath = this.artifactPathFor(role, coords);
    fs.writeFileSync(
      artifactPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          roleId: role.id,
          coords,
          notes
        },
        null,
        2
      ),
      'utf8'
    );
    return artifactPath;
  }

  /**
   * Substitutes the {coords} placeholder in a role command template.
   */
  public static renderCommand(template: string, coords: string): string {
    return template.split('{coords}').join(coords);
  }
}
export default PipelineManager;
