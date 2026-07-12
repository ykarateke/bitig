import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { ContextPackager } from '../src/ContextPackager';
import { BookCompiler } from '../src/BookCompiler';
import { BookConfig } from '../src/BookConfig';
import { Section } from '../src/Section';
import { Chapter } from '../src/Chapter';
import { AgentMetadataGenerator } from '../src/AgentMetadataGenerator';

describe('ContextPackager', () => {
  it('should package AI context correctly in English', () => {
    const config = new BookConfig({
      title: 'Context Book',
      author: 'Ayla',
      description: 'Sci-fi novel',
      theme: 'academic',
      language: 'en',
      citations: [
        {
          term: 'Turing',
          replacement: 'Turing<sup>[1]</sup>'
        }
      ]
    });
    const compiler = new BookCompiler(config);
    jest.spyOn(compiler, 'scanAndLoad').mockImplementation(() => {});

    // Create sections and chapters
    const section1 = new Section(1, 'Introduction');
    const chapter1 = new Chapter('assets/section-1/1.1.md', './assets');
    chapter1.title = 'A New Dawn';
    chapter1.rawContent = 'Paragraph one of the first chapter. This is about Turing.';

    const chapter2 = new Chapter('assets/section-1/1.2.md', './assets');
    chapter2.title = 'The Machine Rise';
    chapter2.rawContent = 'This is the target chapter content.';

    section1.addChapter(chapter1);
    section1.addChapter(chapter2);
    compiler.sections = [section1];

    compiler.metadataGenerator = new AgentMetadataGenerator(config, compiler.sections);

    const packager = new ContextPackager(compiler);
    const result = packager.packageContextFor(1, 2);

    expect(result).toContain('# BOOK WRITING CONTEXT PACK');
    expect(result).toContain('Section 1, Chapter 2');
    expect(result).toContain('Context Book');
    expect(result).toContain('Ayla');
    expect(result).toContain('academic');
    expect(result).toContain('Term: "Turing"');
    expect(result).toContain('Paragraph one of the first chapter.');
    expect(result).toContain('This is the target chapter content.');
  });

  it('should package AI context correctly in Turkish', () => {
    const config = new BookConfig({
      title: 'Bağlam Kitabı',
      author: 'Ayla',
      description: 'Bilim kurgu',
      theme: 'serif',
      language: 'tr',
      citations: [
        {
          term: 'Turing',
          replacement: 'Turing<sup>[1]</sup>'
        }
      ]
    });
    const compiler = new BookCompiler(config);
    jest.spyOn(compiler, 'scanAndLoad').mockImplementation(() => {});

    // Create sections and chapters
    const section1 = new Section(1, 'Giriş');
    const chapter1 = new Chapter('assets/section-1/1.1.md', './assets');
    chapter1.title = 'Yeni Bir Şafak';
    chapter1.rawContent = 'İlk bölümün birinci paragrafı. Bu Turing hakkındadır.';

    const chapter2 = new Chapter('assets/section-1/1.2.md', './assets');
    chapter2.title = 'Makinelerin Yükselişi';
    chapter2.rawContent = 'Bu hedef bölüm içeriğidir.';

    section1.addChapter(chapter1);
    section1.addChapter(chapter2);
    compiler.sections = [section1];

    compiler.metadataGenerator = new AgentMetadataGenerator(config, compiler.sections);

    const packager = new ContextPackager(compiler);
    const result = packager.packageContextFor(1, 2);

    expect(result).toContain('# KİTAP YAZIM BAĞLAM PAKETİ');
    expect(result).toContain('Kısım 1, Bölüm 2');
    expect(result).toContain('Bağlam Kitabı');
    expect(result).toContain('Ayla');
    expect(result).toContain('serif');
    expect(result).toContain('Terim: "Turing"');
    expect(result).toContain('İlk bölümün birinci paragrafı.');
    expect(result).toContain('Bu hedef bölüm içeriğidir.');
  });

  it('should throw error if target chapter does not exist in the book', () => {
    const config = new BookConfig({
      title: 'Context Book',
      assetsDir: './assets',
      distDir: './dist'
    });
    const compiler = new BookCompiler(config);
    jest.spyOn(compiler, 'scanAndLoad').mockImplementation(() => {});
    compiler.sections = [new Section(1, 'S1')];

    const packager = new ContextPackager(compiler);
    expect(() => packager.packageContextFor(1, 10)).toThrow(
      'Target chapter 1.10 not found in the scanned files.'
    );
  });

  it('should package context with missing metadata, empty target chapter, no citations and no preceding chapter', () => {
    const config = new BookConfig({
      title: 'Minimal Context Book',
      assetsDir: './assets',
      distDir: './dist',
      citations: [],
      language: 'en'
    });
    const compiler = new BookCompiler(config);
    jest.spyOn(compiler, 'scanAndLoad').mockImplementation(() => {});

    const section = new Section(1, 'S1');
    const chapter1 = new Chapter('assets/section-1/1.1.md', './assets');
    chapter1.title = 'Empty Target';
    chapter1.rawContent = '';
    section.addChapter(chapter1);
    compiler.sections = [section];
    compiler.metadataGenerator = null;

    const packager = new ContextPackager(compiler);
    const result = packager.packageContextFor(1, 1);

    expect(result).toContain('Empty Target');
    expect(result).toContain('No citations defined.');
    expect(result).toContain('No preceding chapter exists.');
    expect(result).toContain('The target chapter is currently empty.');
  });

  describe('story bible integration', () => {
    const buildCompiler = (assetsDir: string): BookCompiler => {
      const config = new BookConfig({
        title: 'Story Book',
        assetsDir,
        distDir: './dist',
        language: 'en'
      });
      const compiler = new BookCompiler(config);
      jest.spyOn(compiler, 'scanAndLoad').mockImplementation(() => {});

      const section = new Section(1, 'S1');
      const chapter1 = new Chapter(path.join(assetsDir, 'section-1/1.1.md'), assetsDir);
      chapter1.title = 'Opening';
      chapter1.rawContent = 'Aylin Demir looked at the sea.';
      const chapter2 = new Chapter(path.join(assetsDir, 'section-1/1.2.md'), assetsDir);
      chapter2.title = 'Target';
      chapter2.rawContent = 'The target chapter content.';
      section.addChapter(chapter1);
      section.addChapter(chapter2);
      compiler.sections = [section];
      compiler.metadataGenerator = new AgentMetadataGenerator(config, compiler.sections);
      return compiler;
    };

    let tempDir: string;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bitig-story-'));
    });

    afterEach(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('should produce identical output with and without story layers when no story files exist', () => {
      const packager = new ContextPackager(buildCompiler(tempDir));

      const withDefaults = packager.packageContextFor(1, 2);
      const withoutStory = packager.packageContextFor(1, 2, ['global', 'section', 'chapter'], []);

      expect(withDefaults).toBe(withoutStory);
      expect(withDefaults).not.toContain('STORY BIBLE');
    });

    it('should inject the story bible block when story files exist', () => {
      fs.writeFileSync(
        path.join(tempDir, 'characters.json'),
        JSON.stringify({
          version: 1,
          characters: [
            { id: 'aylin', name: 'Aylin Demir', role: 'protagonist', summary: 'The lead.' }
          ]
        }),
        'utf8'
      );

      const packager = new ContextPackager(buildCompiler(tempDir));
      const result = packager.packageContextFor(1, 2);

      expect(result).toContain('## 📖 STORY BIBLE');
      expect(result).toContain('#### Aylin Demir (`aylin`) — protagonist');
      expect(result).toContain('bitig add:event');
    });

    it('should omit the story bible block when story layers are disabled', () => {
      fs.writeFileSync(
        path.join(tempDir, 'characters.json'),
        JSON.stringify({
          version: 1,
          characters: [{ id: 'aylin', name: 'Aylin Demir' }]
        }),
        'utf8'
      );

      const packager = new ContextPackager(buildCompiler(tempDir));
      const result = packager.packageContextFor(1, 2, ['global', 'section', 'chapter'], []);

      expect(result).not.toContain('STORY BIBLE');
      expect(result).not.toContain('bitig add:event');
    });
  });
});
