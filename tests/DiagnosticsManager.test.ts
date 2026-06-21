import * as fs from 'fs';
import * as path from 'path';
import { DiagnosticsManager, QualityGuidelines } from '../src/DiagnosticsManager';

jest.mock('fs');
jest.mock('path', () => {
  const actualPath = jest.requireActual('path');
  return {
    ...actualPath,
    dirname: jest.fn().mockReturnValue('/mock/project'),
    join: jest.fn((...args) => args.join('/'))
  };
});

jest.mock('../src/BookCompiler', () => {
  return {
    BookCompiler: jest.fn().mockImplementation(() => {
      return {
        scanAndLoad: jest.fn(),
        sections: [
          {
            sectionNum: 1,
            title: 'Section 1',
            chapters: [
              {
                chapterNum: 1,
                title: 'Chapter 1',
                rawContent: '# Hello World\n\nThis is chapter 1.1'
              }
            ]
          }
        ],
        config: {
          assetsDir: '/mock/project/assets',
          language: 'en'
        }
      };
    })
  };
});

import { BookCompiler } from '../src/BookCompiler';

describe('DiagnosticsManager', () => {
  let compiler: any;
  let manager: DiagnosticsManager;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    compiler = new BookCompiler(null as any);
    manager = new DiagnosticsManager(compiler);
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('initGuidelines', () => {
    it('should throw an error if guidelines already exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      expect(() => manager.initGuidelines()).toThrow(/Quality guidelines already exist/);
    });

    it('should create default quality guidelines if none exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      manager.initGuidelines();

      expect(fs.writeFileSync).toHaveBeenCalled();
      const args = (fs.writeFileSync as jest.Mock).mock.calls[0];
      expect(args[0]).toBe('/mock/project/quality-guidelines.json');

      const savedData = JSON.parse(args[1]);
      expect(savedData.projectType).toBe('general');
      expect(savedData.baseScore).toBe(100);
      expect(savedData.criteria.AccuracyAndVeracity.weight).toBe(0.25);
    });

    it('should throw an error if custom template file is not found', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      expect(() => manager.initGuidelines('missing.json')).toThrow(
        /Custom template file not found/
      );
    });

    it('should throw an error if custom template contains invalid JSON', () => {
      (fs.existsSync as jest.Mock).mockImplementation((path) => path === 'invalid.json');
      (fs.readFileSync as jest.Mock).mockReturnValue('invalid json {');

      expect(() => manager.initGuidelines('invalid.json')).toThrow(
        /Failed to parse custom template file/
      );
    });

    it('should throw an error if custom template lacks criteria object', () => {
      (fs.existsSync as jest.Mock).mockImplementation((path) => path === 'nocrit.json');
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({ projectType: 'general' }));

      expect(() => manager.initGuidelines('nocrit.json')).toThrow(/missing or invalid "criteria"/);
    });

    it('should throw an error if custom template has invalid criteria definition', () => {
      (fs.existsSync as jest.Mock).mockImplementation((path) => path === 'badcrit.json');
      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify({
          criteria: {
            Accuracy: { weight: 'not-a-number', enabled: true }
          }
        })
      );

      expect(() => manager.initGuidelines('badcrit.json')).toThrow(/Invalid criteria definition/);
    });

    it('should successfully write quality guidelines if custom template is valid', () => {
      (fs.existsSync as jest.Mock).mockImplementation((path) => {
        if (path === '/mock/project/quality-guidelines.json') return false;
        if (path === 'valid.json') return true;
        return false;
      });
      const validCustom = {
        projectType: 'custom-fiction',
        baseScore: 100,
        criteria: {
          PlotLogic: { weight: 0.5, description: 'Plot logic', enabled: true },
          Style: { weight: 0.5, description: 'Style flow', enabled: true }
        },
        customRules: []
      };
      (fs.readFileSync as jest.Mock).mockImplementation((path) => {
        if (path === 'valid.json') return JSON.stringify(validCustom);
        return '';
      });

      manager.initGuidelines('valid.json');

      expect(fs.writeFileSync).toHaveBeenCalled();
      const args = (fs.writeFileSync as jest.Mock).mock.calls.find((c) =>
        c[0].includes('quality-guidelines.json')
      );
      expect(args).toBeTruthy();
      const savedData = JSON.parse(args[1]);
      expect(savedData.projectType).toBe('custom-fiction');
      expect(savedData.criteria.PlotLogic.weight).toBe(0.5);
    });
  });

  describe('packageContext', () => {
    it('should throw an error if guidelines are missing', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      expect(() => manager.packageContext(1, 1)).toThrow(/Quality guidelines not found/);
    });

    it('should throw an error if target chapter is not found', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue('{"some":"json"}');

      expect(() => manager.packageContext(99, 99)).toThrow(/Target chapter 99.99 not found/);
    });

    it('should package context with guidelines and chapter content', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue('{"projectType":"test"}');

      const result = manager.packageContext(1, 1);

      expect(compiler.scanAndLoad).toHaveBeenCalled();
      expect(result).toContain('=== QUALITY GUIDELINES ===');
      expect(result).toContain('{"projectType":"test"}');
      expect(result).toContain('=== CHAPTER CONTENT (1.1) ===');
      expect(result).toContain('# Hello World');
    });
  });

  describe('reportDiagnostics', () => {
    const validGuidelines: QualityGuidelines = {
      projectType: 'test',
      baseScore: 100,
      criteria: {
        TestCriteria1: { weight: 0.6, description: 'desc', enabled: true },
        TestCriteria2: { weight: 0.4, description: 'desc', enabled: true },
        DisabledCriteria: { weight: 0.5, description: 'desc', enabled: false }
      },
      customRules: []
    };

    it('should throw error if temp file is missing', () => {
      (fs.existsSync as jest.Mock).mockImplementation((path) => path !== 'temp.json');
      expect(() => manager.reportDiagnostics(1, 1, 'temp.json')).toThrow(
        /Temporary diagnostics file not found/
      );
    });

    it('should print ascii table and save diagnostic log', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const mockAgentResult = {
        scores: {
          TestCriteria1: 90,
          TestCriteria2: 80
        },
        feedback: 'Good job overall.'
      };

      (fs.readFileSync as jest.Mock).mockImplementation((filePath) => {
        if (filePath.includes('quality-guidelines.json')) {
          return JSON.stringify(validGuidelines);
        }
        if (filePath === 'temp.json') {
          return JSON.stringify(mockAgentResult);
        }
        return '';
      });

      manager.reportDiagnostics(1, 1, 'temp.json');

      // Table prints
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Diagnostic Report for Chapter 1.1')
      );
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('TestCriteria1'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('TestCriteria2'));

      // Feedback prints
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Good job overall.'));

      // Log save
      expect(fs.writeFileSync).toHaveBeenCalled();
      const writeCalls = (fs.writeFileSync as jest.Mock).mock.calls;
      const logCall = writeCalls.find((c) => c[0].includes('diagnostic_1.1.json'));
      expect(logCall).toBeTruthy();

      const savedLog = JSON.parse(logCall[1]);
      expect(savedLog.chapter).toBe('1.1');
      expect(savedLog.projectType).toBe('test');
      expect(savedLog.finalScore).toBe(86); // (90*0.6) + (80*0.4) = 54 + 32 = 86
      expect(savedLog.feedback).toBe('Good job overall.');
    });
  });
});
