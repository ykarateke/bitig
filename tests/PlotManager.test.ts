import * as fs from 'fs';
import { PlotManager } from '../src/PlotManager';

jest.mock('fs');

describe('PlotManager', () => {
  const plotPath = './assets/plot.json';
  let manager: PlotManager;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize empty data if file does not exist', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    manager = new PlotManager(plotPath);

    expect(manager.data).toEqual({ version: 1, threads: [], events: [] });
  });

  it('should load threads and events from file', () => {
    const fakeData = {
      version: 1,
      threads: [{ id: 't1', title: 'Thread 1', status: 'open' }],
      events: [{ id: 'e1', title: 'Event 1', order: 10 }]
    };
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(fakeData));

    manager = new PlotManager(plotPath);

    expect(manager.getThread('t1')?.title).toBe('Thread 1');
    expect(manager.getEvent('e1')?.order).toBe(10);
  });

  it('should fallback to empty data and set loadError when parsing fails', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue('broken{');
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    manager = new PlotManager(plotPath);

    expect(manager.data).toEqual({ version: 1, threads: [], events: [] });
    expect(manager.loadError).not.toBeNull();
    spy.mockRestore();
  });

  it('should add, update, and remove events with id immutability', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    manager = new PlotManager(plotPath);

    manager.addEvent({ id: 'e1', title: 'Event 1', coords: ['1.1'] });
    manager.updateEvent('e1', { id: 'hacked', title: 'Renamed', coords: ['1.2'] } as never);

    const event = manager.getEvent('e1');
    expect(event?.id).toBe('e1');
    expect(event?.title).toBe('Renamed');
    expect(event?.coords).toEqual(['1.2']);

    manager.removeEvent('e1');
    expect(manager.getEvent('e1')).toBeUndefined();
    expect(fs.writeFileSync).toHaveBeenCalledTimes(3);
  });

  it('should reject duplicate event and thread ids', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    manager = new PlotManager(plotPath);

    manager.addEvent({ id: 'e1', title: 'Event 1' });
    expect(() => manager.addEvent({ id: 'e1', title: 'Other' })).toThrow('already exists');

    manager.addThread({ id: 't1', title: 'Thread 1' });
    expect(() => manager.addThread({ id: 't1', title: 'Other' })).toThrow('already exists');
  });

  it('should throw when mutating missing events or threads', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    manager = new PlotManager(plotPath);

    expect(() => manager.updateEvent('ghost', {})).toThrow('not found');
    expect(() => manager.removeEvent('ghost')).toThrow('not found');
    expect(() => manager.updateThread('ghost', {})).toThrow('not found');
    expect(() => manager.removeThread('ghost')).toThrow('not found');
  });

  it('should manage threads and report open ones', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    manager = new PlotManager(plotPath);

    manager.addThread({ id: 't1', title: 'Open by default' });
    manager.addThread({ id: 't2', title: 'Resolved', status: 'resolved' });
    manager.updateThread('t2', { resolutionCoords: '3.4' });

    expect(manager.listThreads()).toHaveLength(2);
    expect(manager.getOpenThreads().map((t) => t.id)).toEqual(['t1']);

    manager.removeThread('t1');
    expect(manager.listThreads()).toHaveLength(1);
  });

  it('should sort chronology by order, then parseable date, then file order', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    manager = new PlotManager(plotPath);

    manager.addEvent({ id: 'no-key', title: 'No sort keys' });
    manager.addEvent({ id: 'late-date', title: 'Late date', date: '2020-01-01' });
    manager.addEvent({ id: 'order-20', title: 'Order 20', order: 20 });
    manager.addEvent({ id: 'early-date', title: 'Early date', date: '2010-01-01' });
    manager.addEvent({ id: 'order-10', title: 'Order 10', order: 10 });
    manager.addEvent({ id: 'fictional', title: 'Fictional date', date: 'Third Age 3019' });

    const ids = manager.getChronology().map((e) => e.id);
    expect(ids).toEqual(['order-10', 'order-20', 'early-date', 'late-date', 'no-key', 'fictional']);
  });

  it('should filter events by thread, character, and coords', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    manager = new PlotManager(plotPath);

    manager.addEvent({
      id: 'e1',
      title: 'Event 1',
      order: 1,
      threadIds: ['t1'],
      characterIds: ['aylin'],
      coords: ['1.1']
    });
    manager.addEvent({ id: 'e2', title: 'Event 2', order: 2, threadIds: ['t2'] });

    expect(manager.listEvents({ threadId: 't1' }).map((e) => e.id)).toEqual(['e1']);
    expect(manager.listEvents({ characterId: 'aylin' }).map((e) => e.id)).toEqual(['e1']);
    expect(manager.listEvents({ coords: '1.1' }).map((e) => e.id)).toEqual(['e1']);
    expect(manager.listEvents()).toHaveLength(2);
  });

  it('should parse dates tolerantly', () => {
    expect(PlotManager.parseDate('2010-08-17')).not.toBeNull();
    expect(PlotManager.parseDate('Third Age 3019')).toBeNull();
    expect(PlotManager.parseDate('')).toBeNull();
    expect(PlotManager.parseDate(undefined)).toBeNull();
  });

  it('should write a template on init and refuse to overwrite without force', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    manager = new PlotManager(plotPath);
    manager.init();
    expect(manager.data.threads.length).toBeGreaterThan(0);
    expect(manager.data.events.length).toBeGreaterThan(0);

    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(manager.data));
    const existing = new PlotManager(plotPath);
    expect(() => existing.init()).toThrow('already exists');
    expect(() => existing.init(true)).not.toThrow();
  });
});
