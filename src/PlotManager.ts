import * as fs from 'fs';
import * as path from 'path';
import { PlotEvent, PlotFileData, PlotThread } from './types';

const defaultPlotData = (): PlotFileData => ({
  version: 1,
  threads: [],
  events: []
});

export class PlotManager {
  public plotPath: string;
  public data: PlotFileData;
  public loadError: string | null = null;

  constructor(plotPath: string) {
    this.plotPath = path.resolve(plotPath);
    this.data = defaultPlotData();
    this.loadData();
  }

  public exists(): boolean {
    return fs.existsSync(this.plotPath);
  }

  /**
   * Loads plot data from plot.json, falling back to empty data
   * when the file is missing or corrupt.
   */
  public loadData(): void {
    this.loadError = null;
    if (!fs.existsSync(this.plotPath)) {
      this.data = defaultPlotData();
      return;
    }

    try {
      const content = fs.readFileSync(this.plotPath, 'utf8').trim();
      if (!content) {
        this.data = defaultPlotData();
        return;
      }
      const parsed = JSON.parse(content) as Partial<PlotFileData>;
      this.data = {
        version: typeof parsed.version === 'number' ? parsed.version : 1,
        threads: Array.isArray(parsed.threads) ? parsed.threads : [],
        events: Array.isArray(parsed.events) ? parsed.events : []
      };
    } catch (err) {
      this.loadError = (err as Error).message;
      console.warn(
        `Warning: Failed to parse plot file. Initializing empty data. Error: ${this.loadError}`
      );
      this.data = defaultPlotData();
    }
  }

  /**
   * Writes the current plot data back to plot.json.
   */
  public saveData(): void {
    const dir = path.dirname(this.plotPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.plotPath, JSON.stringify(this.data, null, 2), 'utf8');
  }

  /**
   * Writes a template plot.json with a single example thread and event.
   */
  public init(force: boolean = false): void {
    if (fs.existsSync(this.plotPath) && !force) {
      throw new Error(`Plot file already exists at ${this.plotPath}`);
    }
    this.data = {
      version: 1,
      threads: [
        {
          id: 'ornek-hikaye-hatti',
          title: 'Örnek hikaye hattı',
          summary: 'Kitap boyunca takip edilen ana gizem veya çatışma.',
          status: 'open',
          introducedIn: '1.1',
          resolutionCoords: null
        }
      ],
      events: [
        {
          id: 'ornek-olay',
          title: 'Örnek olay',
          summary: 'Hikayedeki önemli bir dönüm noktası.',
          type: 'event',
          payoffFor: null,
          date: '',
          order: 10,
          coords: ['1.1'],
          characterIds: [],
          placeIds: [],
          threadIds: ['ornek-hikaye-hatti'],
          consequences: [],
          notes: ''
        }
      ]
    };
    this.saveData();
  }

  public addEvent(data: Partial<PlotEvent> & { id: string; title: string }): void {
    if (!data.id || !data.title) {
      throw new Error('Event requires both "id" and "title" fields.');
    }
    if (this.getEvent(data.id)) {
      throw new Error(`Event with id "${data.id}" already exists.`);
    }
    this.data.events.push({ ...data });
    this.saveData();
  }

  /**
   * Shallow-merges the patch onto the event; arrays are replaced, id is immutable.
   */
  public updateEvent(id: string, patch: Partial<PlotEvent>): void {
    const event = this.getEvent(id);
    if (!event) {
      throw new Error(`Event with id "${id}" not found.`);
    }
    Object.assign(event, patch, { id: event.id });
    this.saveData();
  }

  public removeEvent(id: string): void {
    const idx = this.data.events.findIndex((e) => e.id === id);
    if (idx === -1) {
      throw new Error(`Event with id "${id}" not found.`);
    }
    this.data.events.splice(idx, 1);
    this.saveData();
  }

  public getEvent(id: string): PlotEvent | undefined {
    return this.data.events.find((e) => e.id === id);
  }

  public addThread(data: Partial<PlotThread> & { id: string; title: string }): void {
    if (!data.id || !data.title) {
      throw new Error('Thread requires both "id" and "title" fields.');
    }
    if (this.getThread(data.id)) {
      throw new Error(`Thread with id "${data.id}" already exists.`);
    }
    this.data.threads.push({ ...data });
    this.saveData();
  }

  public updateThread(id: string, patch: Partial<PlotThread>): void {
    const thread = this.getThread(id);
    if (!thread) {
      throw new Error(`Thread with id "${id}" not found.`);
    }
    Object.assign(thread, patch, { id: thread.id });
    this.saveData();
  }

  public removeThread(id: string): void {
    const idx = this.data.threads.findIndex((t) => t.id === id);
    if (idx === -1) {
      throw new Error(`Thread with id "${id}" not found.`);
    }
    this.data.threads.splice(idx, 1);
    this.saveData();
  }

  public getThread(id: string): PlotThread | undefined {
    return this.data.threads.find((t) => t.id === id);
  }

  public listThreads(): PlotThread[] {
    return this.data.threads;
  }

  public getOpenThreads(): PlotThread[] {
    return this.data.threads.filter((t) => (t.status || 'open') === 'open');
  }

  public listEvents(filter?: {
    threadId?: string;
    characterId?: string;
    coords?: string;
  }): PlotEvent[] {
    let events = this.getChronology();
    if (filter?.threadId) {
      events = events.filter((e) => (e.threadIds || []).includes(filter.threadId!));
    }
    if (filter?.characterId) {
      events = events.filter((e) => (e.characterIds || []).includes(filter.characterId!));
    }
    if (filter?.coords) {
      events = events.filter((e) => (e.coords || []).includes(filter.coords!));
    }
    return events;
  }

  /**
   * Canonical chronological ordering used by the linter and context builder.
   * Events with an explicit `order` come first (sorted by it), then events
   * with a parseable `date`, then the rest in file order.
   */
  public getChronology(): PlotEvent[] {
    const indexed = this.data.events.map((event, idx) => ({ event, idx }));
    indexed.sort((a, b) => {
      const aOrder = typeof a.event.order === 'number' ? a.event.order : null;
      const bOrder = typeof b.event.order === 'number' ? b.event.order : null;
      if (aOrder !== null && bOrder !== null && aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      if (aOrder !== null && bOrder === null) return -1;
      if (aOrder === null && bOrder !== null) return 1;

      const aDate = PlotManager.parseDate(a.event.date);
      const bDate = PlotManager.parseDate(b.event.date);
      if (aDate !== null && bDate !== null && aDate !== bDate) {
        return aDate - bDate;
      }
      if (aDate !== null && bDate === null) return -1;
      if (aDate === null && bDate !== null) return 1;

      return a.idx - b.idx;
    });
    return indexed.map((entry) => entry.event);
  }

  /**
   * Parses a date string into a timestamp, or null when missing/unparseable.
   * Only ISO-like formats (YYYY, YYYY-MM, YYYY-MM-DD, optional time) are
   * accepted: V8's Date.parse is lenient enough to extract years out of
   * free-form fictional calendar strings, which must stay unparseable.
   */
  public static parseDate(date?: string): number | null {
    if (!date || !date.trim()) return null;
    const trimmed = date.trim();
    if (!/^\d{4}(-\d{2}(-\d{2})?)?([T ].+)?$/.test(trimmed)) return null;
    const parsed = Date.parse(trimmed);
    return isNaN(parsed) ? null : parsed;
  }
}
export default PlotManager;
