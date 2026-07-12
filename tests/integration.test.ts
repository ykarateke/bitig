import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Bitig CLI Integration Tests', () => {
  let tempDir: string = '';
  const cliPath = path.resolve(__dirname, '../dist/cli.js');

  beforeEach(() => {
    // Create a clean temporary directory for each test
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bitig-test-'));
  });

  afterEach(() => {
    // Clean up the temp directory after each test
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should initialize a template project successfully', () => {
    execSync(`node ${cliPath} init`, { cwd: tempDir });

    expect(fs.existsSync(path.join(tempDir, 'book.json'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, 'assets/section-0/0.1.md'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, 'assets/section-1/1.1.md'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, 'assets/epilogue.md'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, 'assets/bibliography.md'))).toBe(true);

    const configContent = fs.readFileSync(path.join(tempDir, 'book.json'), 'utf8');
    const config = JSON.parse(configContent);
    expect(config.title).toBe('Yeni Kitap Başlığı');
    expect(config.language).toBe('tr');
  });

  it('should execute scaffolding and directory management commands', () => {
    // 1. Init
    execSync(`node ${cliPath} init`, { cwd: tempDir });

    // 2. Add Section
    execSync(`node ${cliPath} add:section 2 --title "Middle Part"`, { cwd: tempDir });
    expect(fs.existsSync(path.join(tempDir, 'assets/section-2'))).toBe(true);

    const configContent = fs.readFileSync(path.join(tempDir, 'book.json'), 'utf8');
    const config = JSON.parse(configContent);
    expect(config.sectionTitles['2']).toBe('Middle Part');

    // 3. Add Chapter
    execSync(`node ${cliPath} add:chapter 2.1 --title "Beginning"`, { cwd: tempDir });
    expect(fs.existsSync(path.join(tempDir, 'assets/section-2/2.1.md'))).toBe(true);

    const chapContent = fs.readFileSync(path.join(tempDir, 'assets/section-2/2.1.md'), 'utf8');
    expect(chapContent).toContain('# Beginning');

    // 4. Move Chapter
    execSync(`node ${cliPath} move:chapter 2.1 2.2`, { cwd: tempDir });
    expect(fs.existsSync(path.join(tempDir, 'assets/section-2/2.1.md'))).toBe(false);
    expect(fs.existsSync(path.join(tempDir, 'assets/section-2/2.2.md'))).toBe(true);

    // 5. Delete Chapter
    execSync(`node ${cliPath} delete:chapter 2.2`, { cwd: tempDir });
    expect(fs.existsSync(path.join(tempDir, 'assets/section-2/2.2.md'))).toBe(false);
  });

  it('should run query and diagnostic commands successfully', () => {
    execSync(`node ${cliPath} init`, { cwd: tempDir });

    // Test stats command
    const statsOutput = execSync(`node ${cliPath} stats`, { cwd: tempDir, encoding: 'utf8' });
    expect(statsOutput).toContain('KİTAP DURUM RAPORU');
    expect(statsOutput).toContain('Toplam Bölüm:     4');

    // Test check/lint command
    const checkOutput = execSync(`node ${cliPath} check`, { cwd: tempDir, encoding: 'utf8' });
    expect(checkOutput).toContain('Tanılamalar çalıştırılıyor');
    // Default template has 1 warning because "Kuantum dolanıklığı" is capitalized but citation term "kuantum dolanıklığı" is lowercase
    expect(checkOutput).toContain('Tanılama tamamlandı: 0 hata, 1 uyarı bulundu.');

    // Test search command
    const searchOutput = execSync(`node ${cliPath} search "kuantum"`, {
      cwd: tempDir,
      encoding: 'utf8'
    });
    expect(searchOutput).toContain('"kuantum" için arama yapılıyor');
    expect(searchOutput).toContain('1 eşleşme bulundu');

    // Test context command
    const contextOutput = execSync(`node ${cliPath} context 1.1`, {
      cwd: tempDir,
      encoding: 'utf8'
    });
    expect(contextOutput).toContain('KİTAP YAZIM BAĞLAM PAKETİ');
    expect(contextOutput).toContain('Kısım 1, Bölüm 1');
    expect(contextOutput).toContain('Temeller ve Dünya');
  });

  it('should compile the book to dist outputs including PDF', () => {
    execSync(`node ${cliPath} init`, { cwd: tempDir });

    // Run build (which defaults to pdf: true)
    execSync(`node ${cliPath} build`, { cwd: tempDir });

    const distPath = path.join(tempDir, 'dist');
    expect(fs.existsSync(path.join(distPath, 'book.md'))).toBe(true);
    expect(fs.existsSync(path.join(distPath, 'book.html'))).toBe(true);
    expect(fs.existsSync(path.join(distPath, 'book-metadata.json'))).toBe(true);
    expect(fs.existsSync(path.join(distPath, 'book.pdf'))).toBe(true);

    // Verify metadata structure
    const metaContent = fs.readFileSync(path.join(distPath, 'book-metadata.json'), 'utf8');
    const metadata = JSON.parse(metaContent);
    expect(metadata.book.title).toBe('Yeni Kitap Başlığı');
    expect(metadata.stats.totalChapters).toBe(4);
  });

  it('should support English localization in CLI outputs', () => {
    execSync(`node ${cliPath} init`, { cwd: tempDir });

    // Modify book.json to use English language
    const configPath = path.join(tempDir, 'book.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config.language = 'en';
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

    // Test stats command in English
    const statsOutput = execSync(`node ${cliPath} stats`, { cwd: tempDir, encoding: 'utf8' });
    expect(statsOutput).toContain('BOOK STATUS REPORT');
    expect(statsOutput).toContain('Total Chapters:     4');

    // Test check command in English
    const checkOutput = execSync(`node ${cliPath} check`, { cwd: tempDir, encoding: 'utf8' });
    expect(checkOutput).toContain('Running book diagnostics...');
    expect(checkOutput).toContain('Diagnostics finished: 0 errors, 1 warnings found.');
  });

  it('should display the diagnostics guide successfully', () => {
    const output = execSync(`node ${cliPath} diagnostics-guide`, {
      cwd: tempDir,
      encoding: 'utf8'
    });
    expect(output).toContain('SEMANTIC DIAGNOSTICS & QUALITY SCORING GUIDE');
    expect(output).toContain('analyze:init');
  });

  describe('story bible workflow', () => {
    it('should scaffold story files and manage character/event/world entries', () => {
      execSync(`node ${cliPath} init`, { cwd: tempDir });

      // Scaffold story bible files
      const initOutput = execSync(`node ${cliPath} story:init`, { cwd: tempDir, encoding: 'utf8' });
      expect(initOutput).toContain('characters.json oluşturuldu');
      expect(fs.existsSync(path.join(tempDir, 'assets/characters.json'))).toBe(true);
      expect(fs.existsSync(path.join(tempDir, 'assets/plot.json'))).toBe(true);
      expect(fs.existsSync(path.join(tempDir, 'assets/world.json'))).toBe(true);

      // Re-running without --force skips existing files
      const rerunOutput = execSync(`node ${cliPath} story:init`, {
        cwd: tempDir,
        encoding: 'utf8'
      });
      expect(rerunOutput).toContain('zaten mevcut');

      // Character CRUD
      execSync(
        `node ${cliPath} add:character aylin --name "Aylin Demir" --role protagonist --summary "Baş karakter."`,
        { cwd: tempDir }
      );
      const charactersData = JSON.parse(
        fs.readFileSync(path.join(tempDir, 'assets/characters.json'), 'utf8')
      );
      expect(charactersData.characters.some((c: { id: string }) => c.id === 'aylin')).toBe(true);

      // Event tagged to chapter 1.1
      execSync(
        `node ${cliPath} add:event ev-baslangic --title "Yolculuk başlar" --order 10 --coords 1.1 --characters aylin`,
        { cwd: tempDir }
      );

      // Tables render
      const listCharacters = execSync(`node ${cliPath} list:characters`, {
        cwd: tempDir,
        encoding: 'utf8'
      });
      expect(listCharacters).toContain('Aylin Demir');
      expect(listCharacters).toContain('+');

      const listEvents = execSync(`node ${cliPath} list:events`, {
        cwd: tempDir,
        encoding: 'utf8'
      });
      expect(listEvents).toContain('Yolculuk başlar');

      // Context injection contains the character card and the event
      const contextOutput = execSync(`node ${cliPath} context 1.1`, {
        cwd: tempDir,
        encoding: 'utf8'
      });
      expect(contextOutput).toContain('HİKAYE REHBERİ (STORY BIBLE)');
      expect(contextOutput).toContain('Aylin Demir (`aylin`)');
      expect(contextOutput).toContain('Yolculuk başlar');

      // --story none suppresses the block
      const noStoryOutput = execSync(`node ${cliPath} context 1.1 --story none`, {
        cwd: tempDir,
        encoding: 'utf8'
      });
      expect(noStoryOutput).not.toContain('HİKAYE REHBERİ');
    });

    it('should fail check with a dangling character reference', () => {
      execSync(`node ${cliPath} init`, { cwd: tempDir });
      execSync(`node ${cliPath} story:init --only plot`, { cwd: tempDir });
      execSync(
        `node ${cliPath} add:event ev-hayalet --title "Hayalet olay" --coords 1.1 --characters hayalet`,
        { cwd: tempDir }
      );

      let failed = false;
      try {
        execSync(`node ${cliPath} check`, { cwd: tempDir, encoding: 'utf8' });
      } catch (error) {
        failed = true;
        const output = (error as { stdout: string }).stdout.toString();
        expect(output).toContain('hayalet');
        expect(output).toContain('tanımlı değil');
      }
      expect(failed).toBe(true);
    });

    it('should scaffold story files with init --fiction', () => {
      execSync(`node ${cliPath} init --fiction`, { cwd: tempDir });
      expect(fs.existsSync(path.join(tempDir, 'assets/characters.json'))).toBe(true);
      expect(fs.existsSync(path.join(tempDir, 'assets/plot.json'))).toBe(true);
      expect(fs.existsSync(path.join(tempDir, 'assets/world.json'))).toBe(true);
    });

    it('should manage world entries and display the story guide', () => {
      execSync(`node ${cliPath} init`, { cwd: tempDir });
      execSync(`node ${cliPath} story:init --only world`, { cwd: tempDir });

      execSync(
        `node ${cliPath} add:world place kadikoy --name "Kadıköy" --type district --summary "Kitabın geçtiği semt."`,
        { cwd: tempDir }
      );
      const listWorld = execSync(`node ${cliPath} list:world place`, {
        cwd: tempDir,
        encoding: 'utf8'
      });
      expect(listWorld).toContain('Kadıköy');

      execSync(`node ${cliPath} delete:world place kadikoy`, { cwd: tempDir });
      const worldData = JSON.parse(
        fs.readFileSync(path.join(tempDir, 'assets/world.json'), 'utf8')
      );
      expect(worldData.places.some((p: { id: string }) => p.id === 'kadikoy')).toBe(false);

      const guideOutput = execSync(`node ${cliPath} story:guide`, {
        cwd: tempDir,
        encoding: 'utf8'
      });
      expect(guideOutput).toContain('STORY BIBLE GUIDE');
      expect(guideOutput).toContain('add:character');
    });
  });
});
