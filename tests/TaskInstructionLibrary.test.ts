import { TaskInstructionLibrary } from '../src/TaskInstructionLibrary';

describe('TaskInstructionLibrary', () => {
  it('should list all six tasks', () => {
    expect(TaskInstructionLibrary.tasks()).toEqual([
      'continue',
      'rewrite',
      'summarize',
      'expand',
      'dialogue',
      'style-transform'
    ]);
  });

  it('should normalize case and whitespace', () => {
    expect(TaskInstructionLibrary.normalizeTask('  CONTINUE ')).toBe('continue');
    expect(TaskInstructionLibrary.normalizeTask('Style-Transform')).toBe('style-transform');
  });

  it('should throw on unknown tasks with the supported list', () => {
    expect(() => TaskInstructionLibrary.normalizeTask('polish')).toThrow('Unknown context task');
    expect(() => TaskInstructionLibrary.normalizeTask('polish')).toThrow('continue, rewrite');
  });

  it('should return localized headers and three instructions per task', () => {
    TaskInstructionLibrary.tasks().forEach((task) => {
      const headerTr = TaskInstructionLibrary.getTaskHeader(task, 'tr');
      const headerEn = TaskInstructionLibrary.getTaskHeader(task, 'en');
      expect(headerTr).toContain('GÖREV');
      expect(headerEn).toContain('TASK');

      const instructions = TaskInstructionLibrary.getInstructions(task, 'en');
      expect(instructions).toHaveLength(3);
      instructions.forEach((line) => expect(line.startsWith('-')).toBe(true));
    });
  });

  it('should interpolate the style target into style-transform instructions', () => {
    const tr = TaskInstructionLibrary.getInstructions('style-transform', 'tr', 'kara film');
    const en = TaskInstructionLibrary.getInstructions('style-transform', 'en', 'noir');

    expect(tr[0]).toContain('"kara film"');
    expect(en[0]).toContain('"noir"');
    expect(en.join('\n')).not.toContain('{target}');
  });

  it('should validate task strings', () => {
    expect(TaskInstructionLibrary.isValidTask('rewrite')).toBe(true);
    expect(TaskInstructionLibrary.isValidTask('unknown')).toBe(false);
  });
});
