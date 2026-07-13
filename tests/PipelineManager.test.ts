import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { PipelineManager } from '../src/PipelineManager';

describe('PipelineManager', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bitig-pipeline-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should fall back to the six default roles when no pipeline.json exists', () => {
    const manager = new PipelineManager(tempDir);

    expect(manager.exists()).toBe(false);
    expect(manager.getRoles().map((r) => r.id)).toEqual([
      'chapter-review',
      'continuity',
      'style',
      'proofreader',
      'fact-checker',
      'final-editor'
    ]);
  });

  it('should write pipeline.json on init and refuse to overwrite without force', () => {
    const manager = new PipelineManager(tempDir);
    manager.init();

    expect(fs.existsSync(path.join(tempDir, 'pipeline.json'))).toBe(true);
    const saved = JSON.parse(fs.readFileSync(path.join(tempDir, 'pipeline.json'), 'utf8'));
    expect(saved.roles).toHaveLength(6);

    expect(() => manager.init()).toThrow('already exists');
    expect(() => manager.init(true)).not.toThrow();
  });

  it('should load user-edited roles and reject malformed ones', () => {
    fs.writeFileSync(
      path.join(tempDir, 'pipeline.json'),
      JSON.stringify({
        version: 1,
        roles: [
          {
            id: 'custom',
            title: 'Custom Agent',
            description: 'Custom pass.',
            contextCommand: 'bitig context {coords}',
            reportCommand: 'bitig pipeline:done custom {coords}',
            artifact: 'pipeline_custom_{coords}.json'
          },
          { title: 'broken role without id' }
        ]
      }),
      'utf8'
    );

    const manager = new PipelineManager(tempDir);
    expect(manager.getRoles().map((r) => r.id)).toEqual(['custom']);
  });

  it('should fall back to defaults for corrupt or empty pipeline files', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    fs.writeFileSync(path.join(tempDir, 'pipeline.json'), 'broken{', 'utf8');
    expect(new PipelineManager(tempDir).getRoles()).toHaveLength(6);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();

    fs.writeFileSync(path.join(tempDir, 'pipeline.json'), JSON.stringify({ roles: [] }), 'utf8');
    expect(new PipelineManager(tempDir).getRoles()).toHaveLength(6);
  });

  it('should detect role completion through diagnostics artifacts', () => {
    const manager = new PipelineManager(tempDir);
    const continuity = manager.getRole('continuity')!;

    expect(manager.isRoleComplete(continuity, '1.2')).toBe(false);
    expect(manager.artifactPathFor(continuity, '1.2')).toBe(
      path.join(tempDir, 'diagnostics', 'review_continuity_1.2.json')
    );

    fs.mkdirSync(path.join(tempDir, 'diagnostics'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, 'diagnostics', 'review_continuity_1.2.json'), '{}', 'utf8');

    expect(manager.isRoleComplete(continuity, '1.2')).toBe(true);
    expect(manager.isRoleComplete(continuity, '1.3')).toBe(false);
  });

  it('should report status and walk roles in order via getNextRole', () => {
    const manager = new PipelineManager(tempDir);
    fs.mkdirSync(path.join(tempDir, 'diagnostics'), { recursive: true });

    expect(manager.getNextRole('1.1')?.id).toBe('chapter-review');

    fs.writeFileSync(path.join(tempDir, 'diagnostics', 'diagnostic_1.1.json'), '{}', 'utf8');
    expect(manager.getNextRole('1.1')?.id).toBe('continuity');

    const status = manager.getStatus('1.1');
    expect(status.filter((s) => s.done).map((s) => s.role.id)).toEqual(['chapter-review']);
    expect(status).toHaveLength(6);
  });

  it('should return null from getNextRole when every role is complete', () => {
    const manager = new PipelineManager(tempDir);
    manager.getRoles().forEach((role) => {
      manager.markDone(role.id, '2.1');
    });

    // markDone writes each role's own artifact pattern, so natural-artifact
    // roles are satisfied too
    expect(manager.getNextRole('2.1')).toBeNull();
  });

  it('should mark roles done with optional JSON notes', () => {
    const manager = new PipelineManager(tempDir);
    const notesPath = path.join(tempDir, 'notes.json');
    fs.writeFileSync(notesPath, JSON.stringify({ fixed: 3 }), 'utf8');

    const artifactPath = manager.markDone('proofreader', '1.2', notesPath);

    expect(artifactPath).toBe(path.join(tempDir, 'diagnostics', 'pipeline_proofreader_1.2.json'));
    const saved = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    expect(saved.roleId).toBe('proofreader');
    expect(saved.coords).toBe('1.2');
    expect(saved.notes).toEqual({ fixed: 3 });

    const withoutNotes = manager.markDone('fact-checker', '1.2');
    expect(JSON.parse(fs.readFileSync(withoutNotes, 'utf8')).notes).toBeNull();
  });

  it('should validate markDone inputs', () => {
    const manager = new PipelineManager(tempDir);

    expect(() => manager.markDone('ghost-role', '1.1')).toThrow('Unknown pipeline role');
    expect(() =>
      manager.markDone('proofreader', '1.1', path.join(tempDir, 'missing.json'))
    ).toThrow('not found');

    const badNotes = path.join(tempDir, 'bad.json');
    fs.writeFileSync(badNotes, 'nope{', 'utf8');
    expect(() => manager.markDone('proofreader', '1.1', badNotes)).toThrow('valid JSON');
  });

  it('should substitute the coords placeholder in commands', () => {
    expect(PipelineManager.renderCommand('bitig review:context {coords} --type style', '3.4')).toBe(
      'bitig review:context 3.4 --type style'
    );
    expect(PipelineManager.renderCommand('echo {coords} {coords}', '1.1')).toBe('echo 1.1 1.1');
  });
});
