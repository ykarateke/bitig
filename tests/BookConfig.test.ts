import { BookConfig } from '../src/BookConfig';

describe('BookConfig', () => {
  describe('constructor defaults', () => {
    it('should set reasonable defaults', () => {
      const config = new BookConfig();
      expect(config.title).toBe('Untitled Book');
      expect(config.author).toBe('Anonymous');
      expect(config.theme).toBe('serif');
      expect(config.pdf).toBe(true);
    });
  });

  describe('validation', () => {
    it('should pass validation with valid options', () => {
      const config = new BookConfig({
        title: 'Valid Book',
        assetsDir: './assets',
        distDir: './dist'
      });
      expect(config.validate()).toBe(true);
    });

    it('should throw an error if title is missing', () => {
      const config = new BookConfig();
      config.title = ''; // bypass constructor fallback
      expect(() => config.validate()).toThrow();
    });

    it('should throw an error if assetsDir is missing', () => {
      const config = new BookConfig();
      config.assetsDir = ''; // bypass constructor fallback
      expect(() => config.validate()).toThrow();
    });
  });

  describe('getCitationRules', () => {
    it('should escape regex characters in string terms', () => {
      const config = new BookConfig({
        citations: [
          {
            term: 'Orch-OR *(Orchestrated)*',
            replacement: 'Orch-OR<sup>[1]</sup>'
          }
        ]
      });

      const compiled = config.getCitationRules();
      expect(compiled.length).toBe(1);
      
      const rule = compiled[0];
      expect(rule.replacement).toBe('Orch-OR<sup>[1]</sup>');
      
      // The term should be a RegExp matching the string literally
      const testString = 'The Orch-OR *(Orchestrated)* theory.';
      expect(testString.match(rule.term)).toBeTruthy();
      expect(testString.replace(rule.term, rule.replacement)).toBe('The Orch-OR<sup>[1]</sup> theory.');
    });
  });
});
