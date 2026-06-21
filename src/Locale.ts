export class Locale {
  private static translations: Record<string, Record<string, string>> = {
    tr: {
      tocHtmlHeading: 'İÇİNDEKİLER',
      tocMdHeading: '# İçindekiler\n\n',

      // CLI Stats
      statsReportTitle: 'KİTAP DURUM RAPORU',
      statsAuthor: 'Yazar',
      statsSubtitle: 'Alt Başlık',
      statsTheme: 'Tema',
      statsDraftStats: '[Taslak İstatistikleri]',
      statsTotalSections: 'Toplam Kısım',
      statsTotalChapters: 'Toplam Bölüm',
      statsTotalWords: 'Toplam Kelime',
      statsTotalChars: 'Toplam Karakter',
      statsEstReadingTime: 'Tahmini Okuma Süresi:  {time} dakika',
      statsStructureBreakdown: '[Yapı Detayları]',
      statsSectionLabel: '\nKısım {num}: "{title}" ({count} bölüm)',
      statsChapterLabel: '  - Bölüm {sec}.{chap} "{title}" ({words} kelime)',

      // CLI Check/Lint
      checkRunning: 'Tanılamalar çalıştırılıyor...',
      checkClean: 'Tanılama sorunu bulunamadı! Kitap temiz ve yapay zekaya hazır.',
      checkFinished: '\nTanılama tamamlandı: {errors} hata, {warnings} uyarı bulundu.',

      // Linter messages
      linterEmpty: 'boş veya sadece markdown başlıkları içeriyor',
      linterUnclosedCode: 'kapatılmamış markdown kod bloğu',
      linterBrokenLink: '{target} konumuna giden kırık dahili bağlantı',
      linterUnusedCitation:
        '"{term}" atıf terimi yapılandırmada tanımlanmış ancak kitap içeriğinde hiç eşleşmemiş',

      // CLI Search
      searchRunning: '"{query}" için arama yapılıyor...',
      searchNoMatches: 'Eşleşme bulunamadı.',
      searchFoundMatches: '{count} eşleşme bulundu:',

      // CLI Build/Compiler
      buildLoadingConfig: 'Yapılandırma yükleniyor...',
      buildScanning: 'Kaynak dosyalar taranıyor...',
      buildCompiling: 'Kitap derleniyor...',
      buildSuccess: 'Kitap ve yapay zeka metaverileri başarıyla derlendi!',
      buildPdfSkip: 'PDF üretimi atlandı (yapılandırmada devre dışı bırakıldı).',
      buildGeneratingPdf: 'PDF çıktısı üretiliyor: {path}...',

      // CLI Management
      managerSectionCreated:
        'Section {sectionNum} directory created and titled "{title}" in configuration.', // Manager logs are printed to console
      managerChapterCreated: 'Bölüm şurada oluşturuldu: {filePath}',
      managerChapterMoved: 'Bölüm {fromPath} konumundan {toPath} konumuna taşındı',
      managerChapterDeleted: 'Bölüm silindi: {filePath}',
      managerSynopsisUpdated: '✔ {coords} bölümünün özeti güncellendi.',
      managerTitleUpdated: '✔ {filePath} dosyasındaki başlık "{title}" olarak güncellendi.',
      devServerStarting: 'Geliştirme sunucusu başlatılıyor...',
      devServerCompiling: 'Değişiklik algılandı. Yeniden derleniyor...',
      devServerReady:
        'Önizleme sunucusu hazır. Tarayıcınızda http://localhost:{port}/ adresini açın.',
      cliErrorFailedStartDevServer: 'Geliştirme sunucusu başlatılamadı:',
      captureStarting: 'Ekran görüntüleri üretiliyor...',
      captureSaved: 'Ekran görüntüsü şuraya kaydedildi: {path}',
      captureFailed: 'Ekran görüntüsü alınamadı: {error}',
      captureInvalidPage: 'Geçersiz sayfa numarası: {page}',
      managerChapterTemplate:
        '# {title}\n\nBu bölüm {sectionNum}.{chapterNum} başlığı "{title}". İçeriği buraya yazın.\n',
      initSuccessJson: 'book.json oluşturuldu.',
      initSuccessChapters: 'Örnek bölüm dizinleri ve markdown dosyaları (assets/) oluşturuldu.',
      initSuccessRun: '\nBaşarılı! Kitabı derlemek için şu komutu çalıştırın:\n  bitig build',
      initError: 'Hata: Şablon oluşturulurken bir hata oluştu:',
      cliErrorCompilationFailed: 'Derleme başarısız oldu:',
      cliErrorFailedAddSection: 'Kısım eklenemedi:',
      cliErrorFailedAddChapter: 'Bölüm eklenemedi:',
      cliErrorFailedMoveChapter: 'Bölüm taşınamadı:',
      cliErrorFailedDeleteChapter: 'Bölüm silinemedi:',
      cliErrorFailedLoadStats: 'İstatistikler yüklenemedi:',
      cliErrorFailedRunCheck: 'Tanılamalar çalıştırılamadı:',
      cliErrorFailedPackageContext: 'Bağlam paketi oluşturulamadı:',
      cliErrorFailedSearch: 'Arama başarısız oldu:',

      // Context Packager
      contextTitle: '# KİTAP YAZIM BAĞLAM PAKETİ',
      contextIntro: 'Bu paket şunun yazılması veya düzenlenmesi için özel olarak derlenmiştir:',
      contextTargetChapter: '👉 **Kısım {sec}, Bölüm {chap}**: "{title}"',
      contextMetadataHeader: '## 1. GENEL KİTAP METAVERİLERİ',
      contextBookTitle: 'Başlık',
      contextBookSubtitle: 'Alt Başlık',
      contextBookAuthor: 'Yazar',
      contextBookDescription: 'Açıklama',
      contextBookTheme: 'Tema',
      contextStructureHeader: '## 2. KİTAP YAPISI VE ÖZETLERİ',
      contextStructureIntro:
        'Her bölümün ilk paragrafını (özetini) içeren kitap taslağı aşağıdadır:',
      contextStructureNoSynopsis: 'Özet bulunmuyor.',
      contextStructureNoContent: 'Henüz içerik yok.',
      contextStructureSection: '### Kısım {sec}: {title}',
      contextStructureChapter: '  - Bölüm {sec}.{chap} "{title}": {synopsis}{marker}',
      contextGuidelinesHeader: '## 3. STİL REHBERİ VE ATIF KURALLARI',
      contextGuidelinesIntro:
        'Aşağıdaki terimleri otomatik olarak uygulayın. Derleyici bunları üst simge biçimlendirmesini kullanarak eşleştirecektir:',
      contextGuidelinesNoCitations: 'Atıf tanımlanmadı.',
      contextGuidelinesRule: '- Terim: "{term}" -> Atıf: "{replacement}"',
      contextPrecedingHeader: '## 4. ÖNCEKİ BÖLÜM İÇERİĞİ (Anlatı Akışı İçin)',
      contextPrecedingIntro:
        'Anlatı akışını ve karakter tutarlılığını korumak için bir önceki bölümün (Bölüm {sec}.{chap} "{title}") tam metni aşağıdadır:',
      contextPrecedingNone: 'Bu kitabın ilk bölümüdür. Önceki bir bölüm bulunmuyor.',
      contextTargetHeader: '## 5. HEDEF BÖLÜMÜN MEVCUT İÇERİĞİ (Düzenlemek veya devam etmek için)',
      contextTargetIntro:
        'Hedef bölümün mevcut içeriği aşağıdadır. Bunu genişletin, düzenleyin veya yeniden yazın:',
      contextTargetEmpty: 'Hedef bölüm şu anda boş.',
      contextInstructionsHeader: '[YAPAY ZEKA AJANI İÇİN TALİMATLAR]',
      contextInstruction1: '- Bir önceki bölümün stilini, kelime dağarcığını ve tonunu koruyun.',
      contextInstruction2: '- Özetlerde zaten ele alan bilgileri tekrarlamayın.',
      contextInstruction3: '- Atıf terimlerini doğal bir şekilde entegre edin.',
      contextInstruction4: '- YALNIZCA geçerli markdown metni çıktısı verin.'
    },
    en: {
      tocHtmlHeading: 'TABLE OF CONTENTS',
      tocMdHeading: '# Table of Contents\n\n',

      // CLI Stats
      statsReportTitle: 'BOOK STATUS REPORT',
      statsAuthor: 'Author',
      statsSubtitle: 'Subtitle',
      statsTheme: 'Theme',
      statsDraftStats: '[Draft Statistics]',
      statsTotalSections: 'Total Sections',
      statsTotalChapters: 'Total Chapters',
      statsTotalWords: 'Total Words',
      statsTotalChars: 'Total Characters',
      statsEstReadingTime: 'Est. Reading Time:  {time} minutes',
      statsStructureBreakdown: '[Structure Breakdown]',
      statsSectionLabel: '\nSection {num}: "{title}" ({count} chapters)',
      statsChapterLabel: '  - Chapter {sec}.{chap} "{title}" ({words} words)',

      // CLI Check/Lint
      checkRunning: 'Running book diagnostics...',
      checkClean: 'No diagnostics issues found! Book is clean and AI-ready.',
      checkFinished: '\nDiagnostics finished: {errors} errors, {warnings} warnings found.',

      // Linter messages
      linterEmpty: 'Chapter is empty or only contains a title.',
      linterUnclosedCode:
        'Contains an unclosed markdown code block (odd number of triple backticks).',
      linterBrokenLink: 'Broken internal markdown link: "{target}" does not exist.',
      linterUnusedCitation:
        'Citation term "{term}" is defined in config but never matched in the book content.',

      // CLI Search
      searchRunning: 'Searching for "{query}"...',
      searchNoMatches: 'No matches found.',
      searchFoundMatches: 'Found {count} match(es):',

      // CLI Build/Compiler
      buildLoadingConfig: 'Loading configuration...',
      buildScanning: 'Scanning source files...',
      buildCompiling: 'Compiling book...',
      buildSuccess: 'Book and AI metadata successfully compiled!',
      buildPdfSkip: 'PDF generation skipped (disabled in configuration).',
      buildGeneratingPdf: 'Generating PDF output: {path}...',

      // CLI Management
      managerSectionCreated:
        '✔ Section {sectionNum} directory created and titled "{title}" in configuration.',
      managerChapterCreated: '✔ Chapter created at: {filePath}',
      managerChapterMoved: '✔ Moved chapter from {fromPath} to {toPath}',
      managerChapterDeleted: '✔ Chapter deleted: {filePath}',
      managerSynopsisUpdated: '✔ Synopsis for chapter {coords} has been updated.',
      managerTitleUpdated: '✔ Title in {filePath} has been updated to "{title}".',
      devServerStarting: 'Starting development server...',
      devServerCompiling: 'Change detected. Recompiling...',
      devServerReady: 'Preview server ready. Open http://localhost:{port}/ in your browser.',
      cliErrorFailedStartDevServer: 'Failed to start development server:',
      captureStarting: 'Generating screenshots...',
      captureSaved: 'Screenshot saved to: {path}',
      captureFailed: 'Failed to capture screenshot: {error}',
      captureInvalidPage: 'Invalid page number: {page}',
      managerChapterTemplate:
        '# {title}\n\nThis is chapter {sectionNum}.{chapterNum} titled "{title}". Fill in the content.\n',
      initSuccessJson: 'book.json created.',
      initSuccessChapters: 'Sample chapter directories and markdown files (assets/) created.',
      initSuccessRun: '\nSuccess! To compile the book, run:\n  bitig build',
      initError: 'Error: An error occurred while creating the template:',
      cliErrorCompilationFailed: 'Compilation Failed:',
      cliErrorFailedAddSection: 'Failed to add section:',
      cliErrorFailedAddChapter: 'Failed to add chapter:',
      cliErrorFailedMoveChapter: 'Failed to move chapter:',
      cliErrorFailedDeleteChapter: 'Failed to delete chapter:',
      cliErrorFailedLoadStats: 'Failed to load statistics:',
      cliErrorFailedRunCheck: 'Diagnostics failed to run:',
      cliErrorFailedPackageContext: 'Failed to package context:',
      cliErrorFailedSearch: 'Search failed:',

      // Context Packager
      contextTitle: '# BOOK WRITING CONTEXT PACK',
      contextIntro: 'This pack is compiled specifically for writing or refining:',
      contextTargetChapter: '👉 **Section {sec}, Chapter {chap}**: "{title}"',
      contextMetadataHeader: '## 1. GENERAL BOOK METADATA',
      contextBookTitle: 'Title',
      contextBookSubtitle: 'Subtitle',
      contextBookAuthor: 'Author',
      contextBookDescription: 'Description',
      contextBookTheme: 'Theme',
      contextStructureHeader: '## 2. BOOK STRUCTURE & SYNOPSES',
      contextStructureIntro:
        'Here is the outline of the book, including the first paragraph (synopsis) of each chapter:',
      contextStructureNoSynopsis: 'No synopses available.',
      contextStructureNoContent: 'No content yet.',
      contextStructureSection: '### Section {sec}: {title}',
      contextStructureChapter: '  - Chapter {sec}.{chap} "{title}": {synopsis}{marker}',
      contextGuidelinesHeader: '## 3. STYLE GUIDELINES & CITATION RULES',
      contextGuidelinesIntro:
        'Apply the following terms automatically. The compiler will map them using superscript formatting:',
      contextGuidelinesNoCitations: 'No citations defined.',
      contextGuidelinesRule: '- Term: "{term}" -> Citation: "{replacement}"',
      contextPrecedingHeader: '## 4. PRECEDING CHAPTER CONTENT (For Narrative Flow)',
      contextPrecedingIntro:
        'Here is the full text of the preceding chapter (Chapter {sec}.{chap} "{title}") to maintain narrative flow and character consistency:',
      contextPrecedingNone: 'This is the first chapter of the book. No preceding chapter exists.',
      contextTargetHeader: '## 5. TARGET CHAPTER CURRENT CONTENT (To edit or continue)',
      contextTargetIntro:
        'Here is the current content of the target chapter. Expand, edit, or rewrite this:',
      contextTargetEmpty: 'The target chapter is currently empty.',
      contextInstructionsHeader: '[INSTRUCTIONS FOR AI AGENT]',
      contextInstruction1: '- Maintain the style, vocabulary, and tone of the preceding chapter.',
      contextInstruction2: '- Do not repeat information already covered in the synopses.',
      contextInstruction3: '- Integrate the citation terms naturally.',
      contextInstruction4: '- Output ONLY valid markdown text.'
    },
    de: {
      tocHtmlHeading: 'INHALTSVERZEICHNIS',
      tocMdHeading: '# Inhaltsverzeichnis\n\n',

      // CLI Stats
      statsReportTitle: 'BUCH-STATUSBERICHT',
      statsAuthor: 'Autor',
      statsSubtitle: 'Untertitel',
      statsTheme: 'Thema',
      statsDraftStats: '[Entwurf-Statistiken]',
      statsTotalSections: 'Gesamtanzahl Abschnitte',
      statsTotalChapters: 'Gesamtanzahl Kapitel',
      statsTotalWords: 'Gesamtzahl Wörter',
      statsTotalChars: 'Gesamtzahl Zeichen',
      statsEstReadingTime: 'Geschätzte Lesezeit: {time} Minuten',
      statsStructureBreakdown: '[Struktur-Übersicht]',
      statsSectionLabel: '\nAbschnitt {num}: "{title}" ({count} Kapitel)',
      statsChapterLabel: '  - Kapitel {sec}.{chap} "{title}" ({words} Wörter)',

      // CLI Check/Lint
      checkRunning: 'Buch-Diagnose wird ausgeführt...',
      checkClean: 'Keine Diagnoseprobleme gefunden! Buch ist sauber und bereit für die KI.',
      checkFinished: '\nDiagnose abgeschlossen: {errors} Fehler, {warnings} Warnungen gefunden.',

      // Linter messages
      linterEmpty: 'Kapitel ist leer oder enthält nur einen Titel.',
      linterUnclosedCode:
        'Enthält einen nicht geschlossenen Markdown-Codeblock (ungerade Anzahl dreifacher Backticks).',
      linterBrokenLink: 'Fehlerhafter interner Markdown-Link: "{target}" existiert nicht.',
      linterUnusedCitation:
        'Zitierbegriff "{term}" ist in der Konfiguration definiert, wurde aber im Buchinhalt nicht gefunden.',

      // CLI Search
      searchRunning: 'Suche nach "{query}"...',
      searchNoMatches: 'Keine Treffer gefunden.',
      searchFoundMatches: '{count} Treffer gefunden:',

      // CLI Build/Compiler
      buildLoadingConfig: 'Konfiguration wird geladen...',
      buildScanning: 'Quelldateien werden gescannt...',
      buildCompiling: 'Buch wird kompiliert...',
      buildSuccess: 'Buch und KI-Metadaten erfolgreich kompiliert!',
      buildPdfSkip: 'PDF-Erstellung übersprungen (in der Konfiguration deaktiviert).',
      buildGeneratingPdf: 'PDF-Ausgabe wird generiert: {path}...',

      // CLI Management
      managerSectionCreated:
        '✔ Ordner für Abschnitt {sectionNum} wurde erstellt und in der Konfiguration mit dem Titel "{title}" benannt.',
      managerChapterCreated: '✔ Kapitel erstellt unter: {filePath}',
      managerChapterMoved: '✔ Kapitel von {fromPath} nach {toPath} verschoben',
      managerChapterDeleted: '✔ Kapitel gelöscht: {filePath}',
      managerSynopsisUpdated: '✔ Zusammenfassung für Kapitel {coords} wurde aktualisiert.',
      managerTitleUpdated: '✔ Titel in {filePath} wurde auf "{title}" aktualisiert.',
      devServerStarting: 'Entwicklungsserver wird gestartet...',
      devServerCompiling: 'Änderung erkannt. Recompilierung läuft...',
      devServerReady:
        'Vorschau-Server bereit. Öffnen Sie http://localhost:{port}/ in Ihrem Browser.',
      cliErrorFailedStartDevServer: 'Fehler beim Starten des Entwicklungsservers:',
      captureStarting: 'Screenshots werden generiert...',
      captureSaved: 'Screenshot gespeichert unter: {path}',
      captureFailed: 'Fehler beim Erstellen des Screenshots: {error}',
      captureInvalidPage: 'Ungültige Seitennummer: {page}',
      managerChapterTemplate:
        '# {title}\n\nDies ist Kapitel {sectionNum}.{chapterNum} mit dem Titel "{title}". Fügen Sie hier den Inhalt ein.\n',
      initSuccessJson: 'book.json erstellt.',
      initSuccessChapters: 'Beispiel-Kapitelverzeichnisse und Markdown-Dateien (assets/) erstellt.',
      initSuccessRun:
        '\nErfolgreich! Führen Sie Folgendes aus, um das Buch zu kompilieren:\n  bitig build',
      initError: 'Fehler: Bei der Erstellung der Vorlage ist ein Fehler aufgetreten:',
      cliErrorCompilationFailed: 'Kompilierung fehlgeschlagen:',
      cliErrorFailedAddSection: 'Abschnitt konnte nicht hinzugefügt werden:',
      cliErrorFailedAddChapter: 'Kapitel konnte nicht hinzugefügt werden:',
      cliErrorFailedMoveChapter: 'Kapitel konnte nicht verschoben werden:',
      cliErrorFailedDeleteChapter: 'Kapitel konnte nicht gelöscht werden:',
      cliErrorFailedLoadStats: 'Statistiken konnten nicht geladen werden:',
      cliErrorFailedRunCheck: 'Diagnose konnte nicht ausgeführt werden:',
      cliErrorFailedPackageContext: 'Kontext konnte nicht paketiert werden:',
      cliErrorFailedSearch: 'Suche fehlgeschlagen:',

      // Context Packager
      contextTitle: '# BUCH-SCHREIBKONTEXT-PAKET',
      contextIntro:
        'Dieses Paket wurde speziell zum Schreiben oder Verfeinern von Folgendem erstellt:',
      contextTargetChapter: '👉 **Abschnitt {sec}, Kapitel {chap}**: "{title}"',
      contextMetadataHeader: '## 1. ALLGEMEINE BUCH-METADATEN',
      contextBookTitle: 'Titel',
      contextBookSubtitle: 'Untertitel',
      contextBookAuthor: 'Autor',
      contextBookDescription: 'Beschreibung',
      contextBookTheme: 'Thema',
      contextStructureHeader: '## 2. BUCHSTRUKTUR & ZUSAMMENFASSUNGEN',
      contextStructureIntro:
        'Hier ist die Gliederung des Buches, einschließlich des ersten Absatzes (Zusammenfassung) jedes Kapitels:',
      contextStructureNoSynopsis: 'Keine Zusammenfassungen verfügbar.',
      contextStructureNoContent: 'Noch kein Inhalt vorhanden.',
      contextStructureSection: '### Abschnitt {sec}: {title}',
      contextStructureChapter: '  - Kapitel {sec}.{chap} "{title}": {synopsis}{marker}',
      contextGuidelinesHeader: '## 3. STILRICHTLINIEN & ZITIERREGELN',
      contextGuidelinesIntro:
        'Wenden Sie die folgenden Begriffe automatisch an. Der Compiler formatiert sie hochgestellt:',
      contextGuidelinesNoCitations: 'Keine Zitate definiert.',
      contextGuidelinesRule: '- Begriff: "{term}" -> Zitat: "{replacement}"',
      contextPrecedingHeader: '## 4. INHALT DES VORHERIGEN KAPITELS (Für den Erzählfluss)',
      contextPrecedingIntro:
        'Hier ist der vollständige Text des vorherigen Kapitels (Kapitel {sec}.{chap} "{title}"), um den Erzählfluss und die Konsistenz der Charaktere zu wahren:',
      contextPrecedingNone:
        'Dies ist das erste Kapitel des Buches. Es gibt kein vorheriges Kapitel.',
      contextTargetHeader:
        '## 5. AKTUELLER INHALT DES ZIELKAPITELS (Zum Bearbeiten oder Fortfahren)',
      contextTargetIntro:
        'Hier ist der aktuelle Inhalt des Zielkapitels. Erweitern, bearbeiten oder schreiben Sie diesen neu:',
      contextTargetEmpty: 'Das Zielkapitel ist derzeit leer.',
      contextInstructionsHeader: '[ANWEISUNGEN FÜR DEN KI-AGENTEN]',
      contextInstruction1:
        '- Behalten Sie Stil, Vokabular und Tonfall des vorherigen Kapitels bei.',
      contextInstruction2:
        '- Wiederholen Sie keine Informationen, die bereits in den Zusammenfassungen behandelt wurden.',
      contextInstruction3: '- Integrieren Sie die Zitierbegriffe natürlich.',
      contextInstruction4: '- Geben Sie NUR gültigen Markdown-Text aus.'
    }
  };

  /**
   * Retrieves the translation text for the specified key.
   * Normalize input language, default to Turkish ('tr')
   */
  public static get(
    key: string,
    lang: string = 'tr',
    replaces?: Record<string, string | number>
  ): string {
    let normLang = 'en';
    const l = lang.toLowerCase();
    if (l.startsWith('tr')) {
      normLang = 'tr';
    } else if (l.startsWith('de')) {
      normLang = 'de';
    }
    let text = Locale.translations[normLang]?.[key] || Locale.translations['en']?.[key] || key;
    if (replaces) {
      Object.entries(replaces).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return text;
  }
}
export default Locale;
