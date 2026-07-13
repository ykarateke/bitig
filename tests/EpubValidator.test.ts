import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import JSZip from 'jszip';
import { EpubValidator } from '../src/EpubValidator';
import { BookConfig } from '../src/BookConfig';
import { EpubCompiler } from '../src/EpubCompiler';
import { StyleManager } from '../src/StyleManager';
import { Section } from '../src/Section';
import { Chapter } from '../src/Chapter';

interface EpubOverrides {
  mimetypeContent?: string;
  mimetypeCompressed?: boolean;
  prependEntry?: boolean;
  skipContainer?: boolean;
  opfPathInContainer?: string;
  opf?: string;
  skipChapterFile?: boolean;
  chapterXhtml?: string;
}

const VALID_OPF = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>Test Book</dc:title>
    <dc:language>en</dc:language>
    <dc:identifier id="uid">urn:uuid:test</dc:identifier>
    <meta property="dcterms:modified">2026-07-13T00:00:00Z</meta>
    <meta name="cover" content="cover-img"/>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="chapter-1" href="chapters/chapter1.xhtml" media-type="application/xhtml+xml"/>
    <item id="cover-img" href="images/cover.png" media-type="image/png" properties="cover-image"/>
  </manifest>
  <spine>
    <itemref idref="chapter-1"/>
  </spine>
</package>`;

const VALID_CHAPTER = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Ch 1</title></head>
<body><p>Text with an image.</p><img src="../images/cover.png" alt="cover"/></body></html>`;

describe('EpubValidator', () => {
  let tempDir: string;
  const validator = new EpubValidator();

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bitig-epubval-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  const buildEpub = async (overrides: EpubOverrides = {}): Promise<string> => {
    const zip = new JSZip();

    if (overrides.prependEntry) {
      zip.file('intruder.txt', 'first entry', { compression: 'STORE' });
    }
    zip.file('mimetype', overrides.mimetypeContent ?? 'application/epub+zip', {
      compression: overrides.mimetypeCompressed ? 'DEFLATE' : 'STORE'
    });
    if (!overrides.skipContainer) {
      zip.folder('META-INF')!.file(
        'container.xml',
        `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="${overrides.opfPathInContainer ?? 'OEBPS/content.opf'}" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`
      );
    }
    const oebps = zip.folder('OEBPS')!;
    oebps.file('content.opf', overrides.opf ?? VALID_OPF);
    oebps.file(
      'nav.xhtml',
      '<html xmlns="http://www.w3.org/1999/xhtml"><body><nav epub:type="toc" xmlns:epub="http://www.idpf.org/2007/ops"><ol><li><a href="chapters/chapter1.xhtml">Ch 1</a></li></ol></nav></body></html>'
    );
    if (!overrides.skipChapterFile) {
      oebps.folder('chapters')!.file('chapter1.xhtml', overrides.chapterXhtml ?? VALID_CHAPTER);
    }
    oebps.folder('images')!.file('cover.png', Buffer.from([0x89, 0x50, 0x4e, 0x47]));

    const buffer = await zip.generateAsync({ type: 'nodebuffer' });
    const epubPath = path.join(tempDir, 'test.epub');
    fs.writeFileSync(epubPath, buffer);
    return epubPath;
  };

  it('should pass a structurally valid EPUB with no messages', async () => {
    const epubPath = await buildEpub();
    expect(await validator.validate(epubPath)).toEqual([]);
  });

  it('should throw when the file does not exist', async () => {
    await expect(validator.validate(path.join(tempDir, 'missing.epub'))).rejects.toThrow(
      'not found'
    );
  });

  it('should require the mimetype entry to be first and stored', async () => {
    const compressed = await buildEpub({ mimetypeCompressed: true });
    const compressedMessages = await validator.validate(compressed);
    expect(compressedMessages.some((m) => m.message.includes('stored uncompressed'))).toBe(true);

    const wrongFirst = await buildEpub({ prependEntry: true });
    const firstMessages = await validator.validate(wrongFirst);
    expect(
      firstMessages.some((m) => m.message.includes('First archive entry must be "mimetype"'))
    ).toBe(true);
  });

  it('should validate the mimetype content', async () => {
    const epubPath = await buildEpub({ mimetypeContent: 'text/plain' });
    const messages = await validator.validate(epubPath);
    expect(messages.some((m) => m.message.includes('application/epub+zip'))).toBe(true);
  });

  it('should require container.xml and a resolvable rootfile', async () => {
    const noContainer = await buildEpub({ skipContainer: true });
    expect(
      (await validator.validate(noContainer)).some((m) =>
        m.message.includes('Missing container descriptor')
      )
    ).toBe(true);

    const badRoot = await buildEpub({ opfPathInContainer: 'OEBPS/missing.opf' });
    expect(
      (await validator.validate(badRoot)).some((m) =>
        m.message.includes('does not exist in the archive')
      )
    ).toBe(true);
  });

  it('should require the EPUB 3 package metadata', async () => {
    const opf = VALID_OPF.replace('<dc:title>Test Book</dc:title>', '').replace(
      '<meta property="dcterms:modified">2026-07-13T00:00:00Z</meta>',
      ''
    );
    const messages = await validator.validate(await buildEpub({ opf }));

    expect(messages.some((m) => m.message.includes('<dc:title>'))).toBe(true);
    expect(messages.some((m) => m.message.includes('dcterms:modified'))).toBe(true);
  });

  it('should detect manifest items pointing to missing files', async () => {
    const messages = await validator.validate(await buildEpub({ skipChapterFile: true }));
    expect(messages.some((m) => m.message.includes('missing file: chapters/chapter1.xhtml'))).toBe(
      true
    );
  });

  it('should detect duplicate manifest ids and unknown spine idrefs', async () => {
    const opf = VALID_OPF.replace(
      '<itemref idref="chapter-1"/>',
      '<itemref idref="chapter-1"/>\n    <itemref idref="ghost"/>'
    ).replace(
      '<item id="chapter-1" href="chapters/chapter1.xhtml" media-type="application/xhtml+xml"/>',
      '<item id="chapter-1" href="chapters/chapter1.xhtml" media-type="application/xhtml+xml"/>\n    <item id="chapter-1" href="nav.xhtml" media-type="application/xhtml+xml"/>'
    );
    const messages = await validator.validate(await buildEpub({ opf }));

    expect(messages.some((m) => m.message.includes('Duplicate manifest item id'))).toBe(true);
    expect(messages.some((m) => m.message.includes('Spine itemref "ghost"'))).toBe(true);
  });

  it('should require a nav document and warn when no cover is declared', async () => {
    const opf = VALID_OPF.replace(' properties="nav"', '')
      .replace('<meta name="cover" content="cover-img"/>', '')
      .replace(' properties="cover-image"', '');
    const messages = await validator.validate(await buildEpub({ opf }));

    expect(messages.some((m) => m.type === 'error' && m.message.includes('properties="nav"'))).toBe(
      true
    );
    const coverWarning = messages.find((m) => m.message.includes('No cover image declared'));
    expect(coverWarning?.type).toBe('warning');
  });

  it('should warn on image files with non-image media types', async () => {
    const opf = VALID_OPF.replace(
      '<item id="cover-img" href="images/cover.png" media-type="image/png" properties="cover-image"/>',
      '<item id="cover-img" href="images/cover.png" media-type="text/plain" properties="cover-image"/>'
    );
    const messages = await validator.validate(await buildEpub({ opf }));
    expect(messages.some((m) => m.message.includes('looks like an image'))).toBe(true);
  });

  it('should detect broken internal references inside content documents', async () => {
    const chapterXhtml = VALID_CHAPTER.replace('../images/cover.png', '../images/ghost.png');
    const messages = await validator.validate(await buildEpub({ chapterXhtml }));
    expect(
      messages.some(
        (m) => m.message.includes('Broken internal reference') && m.message.includes('ghost.png')
      )
    ).toBe(true);
  });

  it('should ignore external and special-scheme references', async () => {
    const chapterXhtml = VALID_CHAPTER.replace(
      '<img src="../images/cover.png" alt="cover"/>',
      '<a href="https://example.com">x</a><a href="mailto:a@b.c">y</a><a href="#anchor">z</a>'
    );
    const messages = await validator.validate(await buildEpub({ chapterXhtml }));
    expect(messages).toEqual([]);
  });

  it('should validate the real EpubCompiler output with at most a cover warning', async () => {
    const config = new BookConfig({
      title: 'Real Book',
      assetsDir: path.join(tempDir, 'assets'),
      distDir: tempDir,
      language: 'en'
    });
    const section = new Section(1, 'S1');
    const chapter = new Chapter(path.join(tempDir, 'assets/section-1/1.1.md'), tempDir);
    chapter.title = 'Chapter One';
    chapter.rawContent = '# Chapter One\n\nSome real content here.';
    section.addChapter(chapter);

    const epubPath = path.join(tempDir, 'real.epub');
    const compiler = new EpubCompiler(config, [section], new StyleManager());
    await compiler.compileToEpub(epubPath);

    const messages = await validator.validate(epubPath);
    const errors = messages.filter((m) => m.type === 'error');
    expect(errors).toEqual([]);
    // Bitig's cover is an XHTML page, not a cover image, so a warning is expected
    expect(messages.every((m) => m.message.includes('No cover image declared'))).toBe(true);
  });
});
