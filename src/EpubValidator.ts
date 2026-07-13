import * as fs from 'fs';
import * as path from 'path';
import JSZip from 'jszip';
import { LintMessage } from './BookLinter';

interface ManifestItem {
  id: string;
  href: string;
  mediaType: string;
  properties: string;
}

/**
 * Zero-dependency structural pre-flight validation for EPUB 3 files
 * (Kindle/KDP oriented). This is a local companion check, not a replacement
 * for the official epubcheck tool.
 */
export class EpubValidator {
  public async validate(epubPath: string): Promise<LintMessage[]> {
    const messages: LintMessage[] = [];
    const resolved = path.resolve(epubPath);

    if (!fs.existsSync(resolved)) {
      throw new Error(`EPUB file not found: ${resolved}`);
    }

    const buffer = fs.readFileSync(resolved);
    if (buffer.length < 60) {
      messages.push(this._error('epub', 'File is too small to be a valid EPUB archive.'));
      return messages;
    }

    this._checkMimetypeHeader(buffer, messages);

    let zip: JSZip;
    try {
      zip = await JSZip.loadAsync(buffer);
    } catch (e) {
      messages.push(this._error('epub', `Not a readable ZIP archive: ${(e as Error).message}`));
      return messages;
    }

    await this._checkMimetypeContent(zip, messages);
    const opfPath = await this._checkContainer(zip, messages);
    if (opfPath) {
      await this._checkOpf(zip, opfPath, messages);
    }

    return messages;
  }

  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------

  private _error(file: string, message: string): LintMessage {
    return { type: 'error', file, message };
  }

  private _warning(file: string, message: string): LintMessage {
    return { type: 'warning', file, message };
  }

  /**
   * OCF requires the very first local ZIP entry to be an uncompressed
   * (STORED) file named "mimetype". Checked on raw bytes: compression
   * method at offset 8, filename length at 26, filename at offset 30.
   */
  private _checkMimetypeHeader(buffer: Buffer, messages: LintMessage[]): void {
    if (buffer.readUInt32LE(0) !== 0x04034b50) {
      messages.push(this._error('epub', 'Missing ZIP local file header signature.'));
      return;
    }
    const compressionMethod = buffer.readUInt16LE(8);
    const nameLength = buffer.readUInt16LE(26);
    const name = buffer.subarray(30, 30 + nameLength).toString('ascii');

    if (name !== 'mimetype') {
      messages.push(
        this._error('mimetype', `First archive entry must be "mimetype", found "${name}".`)
      );
      return;
    }
    if (compressionMethod !== 0) {
      messages.push(
        this._error('mimetype', 'The "mimetype" entry must be stored uncompressed (STORE).')
      );
    }
  }

  private async _checkMimetypeContent(zip: JSZip, messages: LintMessage[]): Promise<void> {
    const entry = zip.file('mimetype');
    if (!entry) {
      messages.push(this._error('mimetype', 'Missing "mimetype" entry.'));
      return;
    }
    const content = await entry.async('string');
    if (content !== 'application/epub+zip') {
      messages.push(
        this._error(
          'mimetype',
          `Content must be exactly "application/epub+zip", found "${content.trim()}".`
        )
      );
    }
  }

  private async _checkContainer(zip: JSZip, messages: LintMessage[]): Promise<string | null> {
    const entry = zip.file('META-INF/container.xml');
    if (!entry) {
      messages.push(this._error('META-INF/container.xml', 'Missing container descriptor.'));
      return null;
    }
    const content = await entry.async('string');
    const match = content.match(/full-path="([^"]+)"/);
    if (!match) {
      messages.push(
        this._error('META-INF/container.xml', 'No rootfile full-path attribute found.')
      );
      return null;
    }
    const opfPath = match[1];
    if (!zip.file(opfPath)) {
      messages.push(
        this._error(
          'META-INF/container.xml',
          `Rootfile "${opfPath}" does not exist in the archive.`
        )
      );
      return null;
    }
    return opfPath;
  }

  private async _checkOpf(zip: JSZip, opfPath: string, messages: LintMessage[]): Promise<void> {
    const content = await zip.file(opfPath)!.async('string');
    const opfDir = path.posix.dirname(opfPath);

    // Required package metadata (EPUB 3)
    if (!/<dc:title[\s>]/.test(content)) {
      messages.push(this._error(opfPath, 'Missing required <dc:title> metadata.'));
    }
    if (!/<dc:identifier[\s>]/.test(content)) {
      messages.push(this._error(opfPath, 'Missing required <dc:identifier> metadata.'));
    }
    if (!/<dc:language[\s>]/.test(content)) {
      messages.push(this._error(opfPath, 'Missing required <dc:language> metadata.'));
    }
    if (!/property="dcterms:modified"/.test(content)) {
      messages.push(this._error(opfPath, 'Missing required dcterms:modified <meta> element.'));
    }

    const items = this._parseManifestItems(content);
    if (items.length === 0) {
      messages.push(this._error(opfPath, 'Manifest contains no items.'));
      return;
    }

    const ids = new Set<string>();
    items.forEach((item) => {
      if (ids.has(item.id)) {
        messages.push(this._error(opfPath, `Duplicate manifest item id "${item.id}".`));
      }
      ids.add(item.id);

      const resolvedHref = this._resolveHref(opfDir, item.href);
      if (!zip.file(resolvedHref)) {
        messages.push(
          this._error(opfPath, `Manifest item "${item.id}" points to a missing file: ${item.href}`)
        );
      }

      if (/\.(png|jpe?g|gif|svg|webp)$/i.test(item.href) && !item.mediaType.startsWith('image/')) {
        messages.push(
          this._warning(
            opfPath,
            `Item "${item.id}" looks like an image but has media-type "${item.mediaType}".`
          )
        );
      }
    });

    if (!items.some((item) => item.properties.split(/\s+/).includes('nav'))) {
      messages.push(
        this._error(opfPath, 'No manifest item with properties="nav" (EPUB 3 navigation document).')
      );
    }

    const hasCoverImage = items.some((item) =>
      item.properties.split(/\s+/).includes('cover-image')
    );
    const hasCoverMeta = /<meta\s+name="cover"/.test(content);
    if (!hasCoverImage && !hasCoverMeta) {
      messages.push(
        this._warning(
          opfPath,
          'No cover image declared (properties="cover-image" or <meta name="cover">). Kindle/KDP expects a cover.'
        )
      );
    }

    // Spine integrity
    const idrefs = [...content.matchAll(/<itemref\s+[^>]*idref="([^"]+)"/g)].map((m) => m[1]);
    if (idrefs.length === 0) {
      messages.push(this._error(opfPath, 'Spine contains no itemref entries.'));
    }
    idrefs.forEach((idref) => {
      if (!ids.has(idref)) {
        messages.push(
          this._error(opfPath, `Spine itemref "${idref}" has no matching manifest item.`)
        );
      }
    });

    // Internal reference resolution inside content documents
    for (const item of items) {
      if (!item.mediaType.includes('xhtml')) continue;
      const filePath = this._resolveHref(opfDir, item.href);
      const file = zip.file(filePath);
      if (!file) continue;
      const xhtml = await file.async('string');
      const fileDir = path.posix.dirname(filePath);

      const refs = [...xhtml.matchAll(/(?:src|href)="([^"#]+)(?:#[^"]*)?"/g)].map((m) => m[1]);
      refs.forEach((ref) => {
        if (/^(https?:|mailto:|data:|javascript:)/i.test(ref)) return;
        const resolvedRef = this._resolveHref(fileDir, ref);
        if (!zip.file(resolvedRef)) {
          messages.push(
            this._error(filePath, `Broken internal reference: "${ref}" does not exist.`)
          );
        }
      });
    }
  }

  private _parseManifestItems(opfContent: string): ManifestItem[] {
    const manifestMatch = opfContent.match(/<manifest[\s>][\s\S]*?<\/manifest>/);
    if (!manifestMatch) return [];

    return [...manifestMatch[0].matchAll(/<item\s+[^>]*>/g)].map((match) => {
      const tag = match[0];
      const attr = (name: string): string => {
        const attrMatch = tag.match(new RegExp(`${name}="([^"]*)"`));
        return attrMatch ? attrMatch[1] : '';
      };
      return {
        id: attr('id'),
        href: attr('href'),
        mediaType: attr('media-type'),
        properties: attr('properties')
      };
    });
  }

  private _resolveHref(baseDir: string, href: string): string {
    const decoded = decodeURIComponent(href);
    const joined = baseDir === '.' ? decoded : path.posix.join(baseDir, decoded);
    return path.posix.normalize(joined);
  }
}
export default EpubValidator;
