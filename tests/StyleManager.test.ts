import { StyleManager } from '../src/StyleManager';
import { BookConfig } from '../src/BookConfig';
import * as fs from 'fs';

jest.mock('fs');

describe('StyleManager', () => {
  let manager: StyleManager;

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new StyleManager();
  });

  it('should default to serif theme', () => {
    expect(manager.themeName).toBe('serif');
  });

  it('should allow setting predefined themes', () => {
    manager.usePredefinedTheme('sans-serif');
    expect(manager.themeName).toBe('sans-serif');
    expect(manager.getCSS()).toContain('Outfit');

    manager.usePredefinedTheme('academic');
    expect(manager.themeName).toBe('academic');
    expect(manager.getCSS()).toContain('Garamond');

    manager.usePredefinedTheme('serif');
    expect(manager.themeName).toBe('serif');
    expect(manager.getCSS()).toContain('Merriweather');
  });

  it('should default to serif and warn when setting an invalid theme', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    manager.usePredefinedTheme('invalid-theme');
    expect(manager.themeName).toBe('serif');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should support custom CSS files', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue('body { color: red; }');

    manager.useCustomTheme('custom.css');
    expect(manager.getCSS()).toBe('body { color: red; }');
    expect(manager.getStyleBlock()).toContain('<style>\nbody { color: red; }\n</style>');
  });

  it('should throw error if custom CSS path does not exist', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    expect(() => manager.useCustomTheme('nonexistent.css')).toThrow();
  });

  it('should generate cover page HTML', () => {
    const config = new BookConfig({
      title: 'My Novel',
      subtitle: 'A saga',
      author: 'Author'
    });

    const html = manager.generateCoverPage(config);
    expect(html).toContain('MY NOVEL');
    expect(html).toContain('A saga');
    expect(html).toContain('Author');
  });
});
