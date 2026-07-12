import { Locale } from './Locale';

export type ContextTask =
  | 'continue'
  | 'rewrite'
  | 'summarize'
  | 'expand'
  | 'dialogue'
  | 'style-transform';

export interface TaskContextOptions {
  task: ContextTask;
  styleTarget?: string;
}

const TASKS: ContextTask[] = [
  'continue',
  'rewrite',
  'summarize',
  'expand',
  'dialogue',
  'style-transform'
];

const KEY_PREFIX: Record<ContextTask, string> = {
  continue: 'taskContinue',
  rewrite: 'taskRewrite',
  summarize: 'taskSummarize',
  expand: 'taskExpand',
  dialogue: 'taskDialogue',
  'style-transform': 'taskStyle'
};

/**
 * Static, Locale-backed instruction sets for the `bitig context --task` modes.
 * Bitig never calls an LLM: these blocks steer the external agent that
 * consumes the context pack.
 */
export class TaskInstructionLibrary {
  public static tasks(): ContextTask[] {
    return [...TASKS];
  }

  public static isValidTask(input: string): input is ContextTask {
    return (TASKS as string[]).includes(input);
  }

  public static normalizeTask(input: string): ContextTask {
    const cleaned = input.trim().toLowerCase();
    if (TaskInstructionLibrary.isValidTask(cleaned)) {
      return cleaned;
    }
    throw new Error(`Unknown context task: "${input}". Supported: ${TASKS.join(', ')}`);
  }

  public static getTaskHeader(task: ContextTask, lang: string): string {
    return Locale.get(`${KEY_PREFIX[task]}Header`, lang);
  }

  public static getInstructions(task: ContextTask, lang: string, styleTarget?: string): string[] {
    const prefix = KEY_PREFIX[task];
    const replaces = styleTarget ? { target: styleTarget } : undefined;
    return [1, 2, 3].map((i) => Locale.get(`${prefix}${i}`, lang, replaces));
  }
}
export default TaskInstructionLibrary;
