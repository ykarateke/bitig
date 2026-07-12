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
      sectionLabel: '{num}. Bölüm',

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
      buildGeneratingEpub: 'EPUB çıktısı üretiliyor: {path}...',
      buildEpubSkip: 'EPUB üretimi atlandı (yapılandırmada devre dışı bırakıldı).',

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
      captureEpubChapter: 'EPUB bölümü yakalanıyor: {coords}...',
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
      contextInstruction4: '- YALNIZCA geçerli markdown metni çıktısı verin.',
      contextMemoryTitle: '## 🧠 PERSISTENT AGENT MEMORY & FEEDBACK HISTORY',
      contextMemoryIntro:
        'Aşağıda geçmiş kullanıcı geri bildirimleri, alınan stil kararları ve uyulması gereken iş akışı kuralları yer almaktadır. Buradaki kuralları göz önünde bulundurarak yazım gerçekleştirin ve geçmiş hataları tekrarlamayın:',
      contextMemoryGlobalLabel: 'Küresel / Proje Geneli Bellek:',
      contextMemorySectionLabel: 'Bölüm Grubu {sec} Belleği:',
      contextMemoryChapterLabel: 'Bölüm {coords} Belleği:',
      contextMemoryFeedbackLabel: 'Geri Bildirimler & Düzeltmeler:',
      contextMemoryStyleLabel: 'Stil Kararları:',
      contextMemoryRoutineLabel: 'İş Akışı Rutinleri / Kurallar:',

      // Story Bible (Context Packager)
      contextStoryTitle: '## 📖 HİKAYE REHBERİ (STORY BIBLE)',
      contextStoryIntro:
        'Aşağıda bu bölümle ilgili karakterler, olay örgüsü zaman çizelgesi ve dünya bilgileri yer almaktadır. Yazarken bu bilgilerle asla çelişmeyin:',
      contextStoryCharactersHeader: 'Kapsamdaki Karakterler',
      contextStoryRosterHeader: 'Diğer Kadro (Özet Liste)',
      contextStoryTimelineHeader: 'Zaman Çizelgesi (İlgili Olaylar)',
      contextStoryThreadsHeader: 'Açık Hikaye Hatları',
      contextStoryWorldHeader: 'Dünya Referansı',
      contextStoryRulesHeader: 'Dünya Kuralları (Her Zaman Uyun)',
      contextStorySummaryLabel: 'Özet',
      contextStoryStatusLabel: 'Durum',
      contextStoryBirthLabel: 'Doğum',
      contextStoryDeathLabel: 'Ölüm',
      contextStoryPhysicalLabel: 'Fiziksel',
      contextStoryPersonalityLabel: 'Kişilik',
      contextStorySpeechLabel: 'Konuşma Tarzı',
      contextStoryGoalsLabel: 'Hedefler',
      contextStoryRelationshipsLabel: 'İlişkiler',
      contextStoryArcLabel: 'Karakter Gelişimi',
      contextStoryFirstAppearanceLabel: 'İlk Görünüm',
      contextStoryIntroducedInLabel: 'Tanıtıldığı Bölüm',
      contextInstruction5:
        '- Yazdıktan sonra yeni olayları ve karakter değişimlerini `bitig add:event` / `bitig update:character` komutlarıyla kaydedin.',

      // Story CLI
      storyInitSuccess: '✔ {file} oluşturuldu.',
      storyInitExists: '⚠ {file} zaten mevcut, atlandı (üzerine yazmak için --force kullanın).',
      storyCharacterAdded: '✔ "{id}" karakteri eklendi.',
      storyCharacterUpdated: '✔ "{id}" karakteri güncellendi.',
      storyCharacterDeleted: '✔ "{id}" karakteri silindi.',
      storyEventAdded: '✔ "{id}" olayı eklendi.',
      storyEventUpdated: '✔ "{id}" olayı güncellendi.',
      storyEventDeleted: '✔ "{id}" olayı silindi.',
      storyThreadAdded: '✔ "{id}" hikaye hattı eklendi.',
      storyThreadUpdated: '✔ "{id}" hikaye hattı güncellendi.',
      storyThreadDeleted: '✔ "{id}" hikaye hattı silindi.',
      storyWorldAdded: '✔ "{id}" girdisi "{category}" kategorisine eklendi.',
      storyWorldUpdated: '✔ "{id}" girdisi güncellendi ({category}).',
      storyWorldDeleted: '✔ "{id}" girdisi silindi ({category}).',
      storyListEmpty: 'Kayıt bulunamadı.',
      storyTableId: 'ID',
      storyTableName: 'İsim',
      storyTableRole: 'Rol',
      storyTableTitle: 'Başlık',
      storyTableDate: 'Tarih',
      storyTableOrder: 'Sıra',
      storyTableChapters: 'Bölümler',
      storyTableStatus: 'Durum',
      storyTableCategory: 'Kategori',
      cliErrorFailedStoryCommand: 'Hikaye komutu başarısız oldu:',

      // Story Linter
      storyLinterParseError: 'Dosya ayrıştırılamadı: {error}',
      storyLinterDuplicateId: 'Yinelenen id: "{id}"',
      storyLinterDanglingRef: '"{owner}" kaydındaki {refType} referansı tanımlı değil: "{id}"',
      storyLinterUnknownCoords: '"{owner}" kitapta olmayan bir bölüme işaret ediyor: {coords}',
      storyLinterTimelineConflict:
        '"{idA}" ve "{idB}" olaylarının tarih ve sıra (order) değerleri çelişiyor',
      storyLinterDuplicateOrder: 'Sıra değeri {order} birden fazla olayda kullanılmış: {ids}',
      storyLinterUnparseableDate:
        '"{id}" olayının tarihi ayrıştırılamıyor ve sıra (order) değeri yok: "{date}"',
      storyLinterNotBorn: '"{character}" karakteri "{event}" olayı sırasında henüz doğmamış',
      storyLinterAlreadyDead:
        '"{character}" karakteri "{event}" olayı sırasında ölü görünüyor (geri dönüş sahnesi olabilir)',
      storyLinterAgeMismatch:
        '"{character}" karakterinin yaşı ({age}) doğum tarihiyle çelişiyor (beklenen ~{expected})',
      storyLinterNonReciprocal:
        '"{a}" karakteri "{b}" ile ilişki tanımlıyor ancak karşı taraf bu ilişkiyi tanımlamıyor',
      storyLinterUnusedEntity:
        '"{id}" ({name}) hiçbir bölümde geçmiyor ve hiçbir olayda referans edilmiyor',
      storyLinterPossibleUnregistered:
        'Kayıtlı olmayan olası karakter/mekan adı: "{word}" ({count} kez geçiyor)',
      // Context Task Modes
      taskContinueHeader: '📝 GÖREV: BÖLÜMÜ DEVAM ETTİR',
      taskContinue1: '- Hedef bölümün mevcut metnini DEĞİŞTİRMEYİN; kaldığı yerden devam edin.',
      taskContinue2:
        '- Yukarıda yalnızca bölümün son kısmı gösterilmiş olabilir; üslubu ve sahneyi oradan sürdürün.',
      taskContinue3:
        '- Sonraki bölümün özetiyle çelişmeyecek şekilde bölümü doğal bir noktada bitirin.',
      taskRewriteHeader: '📝 GÖREV: BÖLÜMÜ YENİDEN YAZ',
      taskRewrite1: '- Bölümü aynı olay örgüsünü koruyarak baştan sona yeniden yazın.',
      taskRewrite2:
        '- Bellek bölümündeki geri bildirimleri ve stil kararlarını öncelikli olarak uygulayın.',
      taskRewrite3: '- Bölüm başlığını (H1) koruyun; çıktı yalnızca yeni markdown metni olsun.',
      taskSummarizeHeader: '📝 GÖREV: BÖLÜMÜ ÖZETLE',
      taskSummarize1: '- Hedef bölümün içeriğini 1-3 paragraflık bir özete dönüştürün.',
      taskSummarize2: '- Yeni olay veya diyalog EKLEMEYİN; yalnızca mevcut içeriği özetleyin.',
      taskSummarize3:
        '- Özet, sonraki bölümleri yazacak ajanlar için sinopsis olarak kullanılacaktır (bitig update:metadata --synopsis).',
      taskExpandHeader: '📝 GÖREV: BÖLÜMÜ GENİŞLET',
      taskExpand1:
        '- Mevcut sahneleri koruyarak betimleme, iç ses ve ayrıntılarla metni zenginleştirin.',
      taskExpand2: '- Olay örgüsünü ve bölüm sonunu DEĞİŞTİRMEYİN.',
      taskExpand3: '- Tempoyu düşürmemek için gereksiz tekrar eklemekten kaçının.',
      taskDialogueHeader: '📝 GÖREV: DİYALOGLARI DOĞALLAŞTIR',
      taskDialogue1:
        '- Yalnızca diyalog satırlarını iyileştirin; anlatı paragraflarını olabildiğince koruyun.',
      taskDialogue2:
        '- Her karakterin hikaye rehberindeki konuşma tarzına (speechStyle) sadık kalın.',
      taskDialogue3: '- Diyalogları kısaltıp doğallaştırın; bilgi aktarımını sohbete gömün.',
      taskStyleHeader: '📝 GÖREV: STİL DÖNÜŞÜMÜ',
      taskStyle1: '- Bölümü "{target}" üslubuna dönüştürerek yeniden yazın.',
      taskStyle2: '- Olay örgüsünü, karakterleri ve bölüm yapısını aynen koruyun.',
      taskStyle3: '- Kelime seçimini, cümle ritmini ve anlatıcı sesini hedef üsluba uyarlayın.',
      taskPrecedingSkipped: '(Özet görevi için önceki bölüm içeriği bilinçli olarak atlanmıştır.)',
      taskNextSynopsis: '➡️ Sonraki bölüm ({coords} "{title}") özeti: {synopsis}',

      // Prose Analytics
      proseReportTitle: 'METİN ANALİZ RAPORU',
      proseTargetBook: 'Tüm Kitap',
      proseWords: 'Kelime',
      proseSentences: 'Cümle',
      proseAvgSentence: 'Ort. Cümle Uzunluğu (kelime)',
      proseAvgSyllables: 'Ort. Hece / Kelime',
      proseDistribution: 'Cümle Dağılımı: {short} kısa / {medium} orta / {long} uzun',
      proseLongest: 'En Uzun Cümle (kelime)',
      proseLongSentences: 'Çok Uzun Cümleler (>30 kelime)',
      proseDialogue: 'Diyalog / Anlatım Satırları',
      proseReadability: 'Okunabilirlik ({formula}, yaklaşık)',
      proseReadabilityNone: 'içerik yok',
      proseReadabilityVeryEasy: 'çok kolay',
      proseReadabilityEasy: 'kolay',
      proseReadabilityMedium: 'orta',
      proseReadabilityDifficult: 'zor',
      proseRepeatedHeader: 'En Sık Tekrarlanan Kelimeler',
      proseNoRepeats: 'Belirgin kelime tekrarı bulunamadı.',
      proseApproxNote:
        'Not: Okunabilirlik puanı dile duyarlı yaklaşık bir formülle hesaplanır; kesin bir ölçüm değildir.',

      // Writing Goals
      goalsUpdated: '✔ Yazım hedefleri book.json dosyasına kaydedildi.',
      goalsSectionTitle: '[Yazım Hedefleri]',
      goalsTotalLabel: 'Toplam Kelime Hedefi',
      goalsDailyLabel: 'Bugünkü Kelimeler',
      goalsChapterHeader: 'Bölüm Hedefleri',
      goalsNoGoals:
        'book.json içinde "goals" bloğu tanımlı değil. Örnek: bitig goals:set --total 80000 --daily 1000',
      goalsUnder: 'hedefin altında',
      goalsOver: 'hedef üstünde',
      goalsOk: 'hedef aralığında',
      goalsBaselineNote: 'İlk ilerleme kaydı (taban çizgisi) oluşturuldu.',
      copyrightPageTitle: 'TELİF HAKKI',
      copyrightPublisherLabel: 'Yayımcı',
      copyrightPublishedLabel: 'Yayın Tarihi',
      copyrightIsbnLabel: 'ISBN',
      copyrightNoticeText:
        'Tüm hakları saklıdır. Bu yayının hiçbir bölümü, yazarın veya yayıncının önceden yazılı izni olmaksızın, elektronik veya mekanik yöntemler dahil olmak üzere hiçbir şekilde veya hiçbir yolla çoğaltılamaz, dağıtılamaz veya iletilemez.'
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
      sectionLabel: 'Section {num}',

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
      buildGeneratingEpub: 'Generating EPUB output: {path}...',
      buildEpubSkip: 'EPUB generation skipped (disabled in configuration).',

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
      captureEpubChapter: 'Capturing EPUB chapter: {coords}...',
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
      contextInstruction4: '- Output ONLY valid markdown text.',
      contextMemoryTitle: '## 🧠 PERSISTENT AGENT MEMORY & FEEDBACK HISTORY',
      contextMemoryIntro:
        'Below is the history of past user feedback, stylistic decisions, and workflow routines that you must adhere to. Do NOT repeat past mistakes documented here:',
      contextMemoryGlobalLabel: 'Global / Project-Level Memory:',
      contextMemorySectionLabel: 'Section {sec} Memory:',
      contextMemoryChapterLabel: 'Chapter {coords} Memory:',
      contextMemoryFeedbackLabel: 'Feedback Corrections:',
      contextMemoryStyleLabel: 'Stylistic Decisions:',
      contextMemoryRoutineLabel: 'Workflow Routines & Rules:',

      // Story Bible (Context Packager)
      contextStoryTitle: '## 📖 STORY BIBLE',
      contextStoryIntro:
        'Below are the characters, plot timeline, and world facts relevant to this chapter. Never contradict this information while writing:',
      contextStoryCharactersHeader: 'Characters in Scope',
      contextStoryRosterHeader: 'Full Cast Roster (Compact)',
      contextStoryTimelineHeader: 'Timeline (Relevant Events)',
      contextStoryThreadsHeader: 'Open Plot Threads',
      contextStoryWorldHeader: 'World Reference',
      contextStoryRulesHeader: 'World Rules (Always Obey)',
      contextStorySummaryLabel: 'Summary',
      contextStoryStatusLabel: 'Status',
      contextStoryBirthLabel: 'Born',
      contextStoryDeathLabel: 'Died',
      contextStoryPhysicalLabel: 'Physical',
      contextStoryPersonalityLabel: 'Personality',
      contextStorySpeechLabel: 'Speech Style',
      contextStoryGoalsLabel: 'Goals',
      contextStoryRelationshipsLabel: 'Relationships',
      contextStoryArcLabel: 'Character Arc',
      contextStoryFirstAppearanceLabel: 'First Appearance',
      contextStoryIntroducedInLabel: 'Introduced In',
      contextInstruction5:
        '- After writing, record new events and character changes with `bitig add:event` / `bitig update:character` so the story bible stays current.',

      // Story CLI
      storyInitSuccess: '✔ {file} created.',
      storyInitExists: '⚠ {file} already exists, skipped (use --force to overwrite).',
      storyCharacterAdded: '✔ Character "{id}" added.',
      storyCharacterUpdated: '✔ Character "{id}" updated.',
      storyCharacterDeleted: '✔ Character "{id}" deleted.',
      storyEventAdded: '✔ Event "{id}" added.',
      storyEventUpdated: '✔ Event "{id}" updated.',
      storyEventDeleted: '✔ Event "{id}" deleted.',
      storyThreadAdded: '✔ Thread "{id}" added.',
      storyThreadUpdated: '✔ Thread "{id}" updated.',
      storyThreadDeleted: '✔ Thread "{id}" deleted.',
      storyWorldAdded: '✔ Entry "{id}" added to "{category}".',
      storyWorldUpdated: '✔ Entry "{id}" updated ({category}).',
      storyWorldDeleted: '✔ Entry "{id}" deleted ({category}).',
      storyListEmpty: 'No records found.',
      storyTableId: 'ID',
      storyTableName: 'Name',
      storyTableRole: 'Role',
      storyTableTitle: 'Title',
      storyTableDate: 'Date',
      storyTableOrder: 'Order',
      storyTableChapters: 'Chapters',
      storyTableStatus: 'Status',
      storyTableCategory: 'Category',
      cliErrorFailedStoryCommand: 'Story command failed:',

      // Story Linter
      storyLinterParseError: 'Failed to parse file: {error}',
      storyLinterDuplicateId: 'Duplicate id: "{id}"',
      storyLinterDanglingRef: 'Reference {refType} in "{owner}" is not defined: "{id}"',
      storyLinterUnknownCoords:
        '"{owner}" points to a chapter that does not exist in the book: {coords}',
      storyLinterTimelineConflict:
        'Events "{idA}" and "{idB}" have contradicting date and order values',
      storyLinterDuplicateOrder: 'Order value {order} is used by multiple events: {ids}',
      storyLinterUnparseableDate:
        'Event "{id}" has an unparseable date and no order value: "{date}"',
      storyLinterNotBorn: 'Character "{character}" is not yet born during event "{event}"',
      storyLinterAlreadyDead:
        'Character "{character}" appears to be dead during event "{event}" (may be a flashback)',
      storyLinterAgeMismatch:
        'Character "{character}" age ({age}) contradicts the birth date (expected ~{expected})',
      storyLinterNonReciprocal:
        'Character "{a}" defines a relationship with "{b}" but there is no reciprocal entry',
      storyLinterUnusedEntity:
        '"{id}" ({name}) never appears in any chapter and is not referenced by any event',
      storyLinterPossibleUnregistered:
        'Possible unregistered character/place name: "{word}" (occurs {count} times)',
      // Context Task Modes
      taskContinueHeader: '📝 TASK: CONTINUE THE CHAPTER',
      taskContinue1: '- Do NOT modify the existing chapter text; continue from where it stops.',
      taskContinue2:
        '- Only the tail of the chapter may be shown above; pick up the style and scene from there.',
      taskContinue3:
        '- End the chapter at a natural point that does not contradict the next chapter synopsis.',
      taskRewriteHeader: '📝 TASK: REWRITE THE CHAPTER',
      taskRewrite1: '- Rewrite the chapter from start to finish while preserving the same plot.',
      taskRewrite2:
        '- Apply the feedback and stylistic decisions from the memory section with priority.',
      taskRewrite3: '- Keep the chapter title (H1); output only the new markdown text.',
      taskSummarizeHeader: '📝 TASK: SUMMARIZE THE CHAPTER',
      taskSummarize1: '- Condense the target chapter into a 1-3 paragraph summary.',
      taskSummarize2: '- Do NOT invent new events or dialogue; only summarize existing content.',
      taskSummarize3:
        '- The summary will be used as the synopsis for later writing agents (bitig update:metadata --synopsis).',
      taskExpandHeader: '📝 TASK: EXPAND THE CHAPTER',
      taskExpand1:
        '- Enrich the text with description, inner voice, and detail while keeping existing scenes.',
      taskExpand2: '- Do NOT change the plot or the chapter ending.',
      taskExpand3: '- Avoid filler repetition that would slow the pacing.',
      taskDialogueHeader: '📝 TASK: MAKE DIALOGUE NATURAL',
      taskDialogue1:
        '- Improve only the dialogue lines; preserve narration paragraphs as much as possible.',
      taskDialogue2: "- Stay faithful to each character's speechStyle from the story bible.",
      taskDialogue3:
        '- Tighten and naturalize the dialogue; bury exposition inside the conversation.',
      taskStyleHeader: '📝 TASK: STYLE TRANSFORMATION',
      taskStyle1: '- Rewrite the chapter transformed into the "{target}" style.',
      taskStyle2: '- Keep the plot, characters, and chapter structure exactly the same.',
      taskStyle3: '- Adapt word choice, sentence rhythm, and narrator voice to the target style.',
      taskPrecedingSkipped:
        '(The preceding chapter content is intentionally omitted for the summarize task.)',
      taskNextSynopsis: '➡️ Next chapter ({coords} "{title}") synopsis: {synopsis}',

      // Prose Analytics
      proseReportTitle: 'PROSE ANALYSIS REPORT',
      proseTargetBook: 'Whole Book',
      proseWords: 'Words',
      proseSentences: 'Sentences',
      proseAvgSentence: 'Avg. Sentence Length (words)',
      proseAvgSyllables: 'Avg. Syllables / Word',
      proseDistribution: 'Sentence Distribution: {short} short / {medium} medium / {long} long',
      proseLongest: 'Longest Sentence (words)',
      proseLongSentences: 'Very Long Sentences (>30 words)',
      proseDialogue: 'Dialogue / Narration Lines',
      proseReadability: 'Readability ({formula}, approximate)',
      proseReadabilityNone: 'no content',
      proseReadabilityVeryEasy: 'very easy',
      proseReadabilityEasy: 'easy',
      proseReadabilityMedium: 'medium',
      proseReadabilityDifficult: 'difficult',
      proseRepeatedHeader: 'Most Repeated Words',
      proseNoRepeats: 'No significant word repetition found.',
      proseApproxNote:
        'Note: The readability score uses a language-aware approximate formula; it is not an exact measurement.',

      // Writing Goals
      goalsUpdated: '✔ Writing goals saved to book.json.',
      goalsSectionTitle: '[Writing Goals]',
      goalsTotalLabel: 'Total Word Goal',
      goalsDailyLabel: 'Words Today',
      goalsChapterHeader: 'Chapter Goals',
      goalsNoGoals:
        'No "goals" block defined in book.json. Example: bitig goals:set --total 80000 --daily 1000',
      goalsUnder: 'under goal',
      goalsOver: 'over goal',
      goalsOk: 'within goal range',
      goalsBaselineNote: 'First progress entry (baseline) recorded.',
      copyrightPageTitle: 'COPYRIGHT',
      copyrightPublisherLabel: 'Publisher',
      copyrightPublishedLabel: 'Published',
      copyrightIsbnLabel: 'ISBN',
      copyrightNoticeText:
        'All rights reserved. No part of this publication may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the publisher, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law.'
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
      sectionLabel: 'Abschnitt {num}',

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
      buildGeneratingEpub: 'EPUB-Ausgabe wird generiert: {path}...',
      buildEpubSkip: 'EPUB-Erstellung übersprungen (in der Konfiguration deaktiviert).',

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
      captureEpubChapter: 'EPUB-Kapitel wird erfasst: {coords}...',
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
      contextInstruction4: '- Geben Sie NUR gültigen Markdown-Text aus.',
      contextMemoryTitle: '## 🧠 PERSISTENTES AGENTEN-GEDÄCHTNIS & FEEDBACK-VERLAUF',
      contextMemoryIntro:
        'Nachfolgend finden Sie den Verlauf früherer Benutzer-Feedbacks, stilistischer Entscheidungen und Arbeitsabläufe, die Sie einhalten müssen. Wiederholen Sie die hier dokumentierten Fehler der Vergangenheit NICHT:',
      contextMemoryGlobalLabel: 'Globales / Projektweites Gedächtnis:',
      contextMemorySectionLabel: 'Abschnitt {sec} Gedächtnis:',
      contextMemoryChapterLabel: 'Kapitel {coords} Gedächtnis:',
      contextMemoryFeedbackLabel: 'Feedback-Korrekturen:',
      contextMemoryStyleLabel: 'Stilistische Entscheidungen:',
      contextMemoryRoutineLabel: 'Arbeitsabläufe & Regeln:',

      // Story Bible (Context Packager)
      contextStoryTitle: '## 📖 STORY-BIBEL',
      contextStoryIntro:
        'Nachfolgend finden Sie die für dieses Kapitel relevanten Charaktere, die Handlungs-Zeitleiste und Weltfakten. Widersprechen Sie diesen Informationen beim Schreiben niemals:',
      contextStoryCharactersHeader: 'Relevante Charaktere',
      contextStoryRosterHeader: 'Gesamte Besetzung (Kompakt)',
      contextStoryTimelineHeader: 'Zeitleiste (Relevante Ereignisse)',
      contextStoryThreadsHeader: 'Offene Handlungsstränge',
      contextStoryWorldHeader: 'Welt-Referenz',
      contextStoryRulesHeader: 'Weltregeln (Immer Beachten)',
      contextStorySummaryLabel: 'Zusammenfassung',
      contextStoryStatusLabel: 'Status',
      contextStoryBirthLabel: 'Geboren',
      contextStoryDeathLabel: 'Gestorben',
      contextStoryPhysicalLabel: 'Physisch',
      contextStoryPersonalityLabel: 'Persönlichkeit',
      contextStorySpeechLabel: 'Sprechstil',
      contextStoryGoalsLabel: 'Ziele',
      contextStoryRelationshipsLabel: 'Beziehungen',
      contextStoryArcLabel: 'Charakterentwicklung',
      contextStoryFirstAppearanceLabel: 'Erster Auftritt',
      contextStoryIntroducedInLabel: 'Eingeführt In',
      contextInstruction5:
        '- Erfassen Sie nach dem Schreiben neue Ereignisse und Charakteränderungen mit `bitig add:event` / `bitig update:character`, damit die Story-Bibel aktuell bleibt.',

      // Story CLI
      storyInitSuccess: '✔ {file} erstellt.',
      storyInitExists: '⚠ {file} existiert bereits, übersprungen (mit --force überschreiben).',
      storyCharacterAdded: '✔ Charakter "{id}" hinzugefügt.',
      storyCharacterUpdated: '✔ Charakter "{id}" aktualisiert.',
      storyCharacterDeleted: '✔ Charakter "{id}" gelöscht.',
      storyEventAdded: '✔ Ereignis "{id}" hinzugefügt.',
      storyEventUpdated: '✔ Ereignis "{id}" aktualisiert.',
      storyEventDeleted: '✔ Ereignis "{id}" gelöscht.',
      storyThreadAdded: '✔ Handlungsstrang "{id}" hinzugefügt.',
      storyThreadUpdated: '✔ Handlungsstrang "{id}" aktualisiert.',
      storyThreadDeleted: '✔ Handlungsstrang "{id}" gelöscht.',
      storyWorldAdded: '✔ Eintrag "{id}" zu "{category}" hinzugefügt.',
      storyWorldUpdated: '✔ Eintrag "{id}" aktualisiert ({category}).',
      storyWorldDeleted: '✔ Eintrag "{id}" gelöscht ({category}).',
      storyListEmpty: 'Keine Einträge gefunden.',
      storyTableId: 'ID',
      storyTableName: 'Name',
      storyTableRole: 'Rolle',
      storyTableTitle: 'Titel',
      storyTableDate: 'Datum',
      storyTableOrder: 'Reihenfolge',
      storyTableChapters: 'Kapitel',
      storyTableStatus: 'Status',
      storyTableCategory: 'Kategorie',
      cliErrorFailedStoryCommand: 'Story-Befehl fehlgeschlagen:',

      // Story Linter
      storyLinterParseError: 'Datei konnte nicht geparst werden: {error}',
      storyLinterDuplicateId: 'Doppelte ID: "{id}"',
      storyLinterDanglingRef: 'Referenz {refType} in "{owner}" ist nicht definiert: "{id}"',
      storyLinterUnknownCoords:
        '"{owner}" verweist auf ein Kapitel, das im Buch nicht existiert: {coords}',
      storyLinterTimelineConflict:
        'Die Ereignisse "{idA}" und "{idB}" haben widersprüchliche Datums- und Reihenfolgewerte',
      storyLinterDuplicateOrder:
        'Reihenfolgewert {order} wird von mehreren Ereignissen verwendet: {ids}',
      storyLinterUnparseableDate:
        'Ereignis "{id}" hat ein nicht parsbares Datum und keinen Reihenfolgewert: "{date}"',
      storyLinterNotBorn:
        'Charakter "{character}" ist während des Ereignisses "{event}" noch nicht geboren',
      storyLinterAlreadyDead:
        'Charakter "{character}" scheint während des Ereignisses "{event}" tot zu sein (könnte eine Rückblende sein)',
      storyLinterAgeMismatch:
        'Das Alter von Charakter "{character}" ({age}) widerspricht dem Geburtsdatum (erwartet ~{expected})',
      storyLinterNonReciprocal:
        'Charakter "{a}" definiert eine Beziehung zu "{b}", aber es gibt keinen gegenseitigen Eintrag',
      storyLinterUnusedEntity:
        '"{id}" ({name}) kommt in keinem Kapitel vor und wird von keinem Ereignis referenziert',
      storyLinterPossibleUnregistered:
        'Möglicher nicht registrierter Charakter-/Ortsname: "{word}" (kommt {count} Mal vor)',
      // Context Task Modes
      taskContinueHeader: '📝 AUFGABE: KAPITEL FORTSETZEN',
      taskContinue1:
        '- Ändern Sie den vorhandenen Kapiteltext NICHT; setzen Sie dort fort, wo er endet.',
      taskContinue2:
        '- Oben ist möglicherweise nur das Ende des Kapitels zu sehen; übernehmen Sie Stil und Szene von dort.',
      taskContinue3:
        '- Beenden Sie das Kapitel an einem natürlichen Punkt, der der Zusammenfassung des nächsten Kapitels nicht widerspricht.',
      taskRewriteHeader: '📝 AUFGABE: KAPITEL NEU SCHREIBEN',
      taskRewrite1:
        '- Schreiben Sie das Kapitel von Anfang bis Ende neu und bewahren Sie dabei die Handlung.',
      taskRewrite2:
        '- Wenden Sie das Feedback und die Stilentscheidungen aus dem Gedächtnisabschnitt vorrangig an.',
      taskRewrite3:
        '- Behalten Sie den Kapiteltitel (H1) bei; geben Sie nur den neuen Markdown-Text aus.',
      taskSummarizeHeader: '📝 AUFGABE: KAPITEL ZUSAMMENFASSEN',
      taskSummarize1: '- Verdichten Sie das Zielkapitel zu einer Zusammenfassung von 1-3 Absätzen.',
      taskSummarize2:
        '- Erfinden Sie KEINE neuen Ereignisse oder Dialoge; fassen Sie nur vorhandene Inhalte zusammen.',
      taskSummarize3:
        '- Die Zusammenfassung dient späteren Schreibagenten als Synopsis (bitig update:metadata --synopsis).',
      taskExpandHeader: '📝 AUFGABE: KAPITEL ERWEITERN',
      taskExpand1:
        '- Bereichern Sie den Text mit Beschreibung, innerer Stimme und Details, ohne bestehende Szenen zu verändern.',
      taskExpand2: '- Ändern Sie NICHT die Handlung oder das Kapitelende.',
      taskExpand3: '- Vermeiden Sie Füllwiederholungen, die das Tempo verlangsamen.',
      taskDialogueHeader: '📝 AUFGABE: DIALOGE NATÜRLICHER GESTALTEN',
      taskDialogue1:
        '- Verbessern Sie nur die Dialogzeilen; erhalten Sie die Erzählabsätze so weit wie möglich.',
      taskDialogue2:
        '- Bleiben Sie dem Sprechstil (speechStyle) jedes Charakters aus der Story-Bibel treu.',
      taskDialogue3:
        '- Straffen und naturalisieren Sie die Dialoge; verbergen Sie Exposition im Gespräch.',
      taskStyleHeader: '📝 AUFGABE: STILTRANSFORMATION',
      taskStyle1: '- Schreiben Sie das Kapitel im Stil "{target}" neu.',
      taskStyle2: '- Behalten Sie Handlung, Charaktere und Kapitelstruktur exakt bei.',
      taskStyle3: '- Passen Sie Wortwahl, Satzrhythmus und Erzählstimme an den Zielstil an.',
      taskPrecedingSkipped:
        '(Der Inhalt des vorherigen Kapitels wird für die Zusammenfassungsaufgabe absichtlich weggelassen.)',
      taskNextSynopsis: '➡️ Zusammenfassung des nächsten Kapitels ({coords} "{title}"): {synopsis}',

      // Prose Analytics
      proseReportTitle: 'PROSA-ANALYSEBERICHT',
      proseTargetBook: 'Gesamtes Buch',
      proseWords: 'Wörter',
      proseSentences: 'Sätze',
      proseAvgSentence: 'Durchschn. Satzlänge (Wörter)',
      proseAvgSyllables: 'Durchschn. Silben / Wort',
      proseDistribution: 'Satzverteilung: {short} kurz / {medium} mittel / {long} lang',
      proseLongest: 'Längster Satz (Wörter)',
      proseLongSentences: 'Sehr lange Sätze (>30 Wörter)',
      proseDialogue: 'Dialog- / Erzählzeilen',
      proseReadability: 'Lesbarkeit ({formula}, ungefähr)',
      proseReadabilityNone: 'kein Inhalt',
      proseReadabilityVeryEasy: 'sehr leicht',
      proseReadabilityEasy: 'leicht',
      proseReadabilityMedium: 'mittel',
      proseReadabilityDifficult: 'schwierig',
      proseRepeatedHeader: 'Am häufigsten wiederholte Wörter',
      proseNoRepeats: 'Keine auffälligen Wortwiederholungen gefunden.',
      proseApproxNote:
        'Hinweis: Der Lesbarkeitswert verwendet eine sprachabhängige Näherungsformel; er ist keine exakte Messung.',

      // Writing Goals
      goalsUpdated: '✔ Schreibziele in book.json gespeichert.',
      goalsSectionTitle: '[Schreibziele]',
      goalsTotalLabel: 'Gesamtwortziel',
      goalsDailyLabel: 'Wörter heute',
      goalsChapterHeader: 'Kapitelziele',
      goalsNoGoals:
        'Kein "goals"-Block in book.json definiert. Beispiel: bitig goals:set --total 80000 --daily 1000',
      goalsUnder: 'unter dem Ziel',
      goalsOver: 'über dem Ziel',
      goalsOk: 'im Zielbereich',
      goalsBaselineNote: 'Erster Fortschrittseintrag (Basislinie) erfasst.',
      copyrightPageTitle: 'URHEBERRECHT',
      copyrightPublisherLabel: 'Herausgeber',
      copyrightPublishedLabel: 'Veröffentlicht',
      copyrightIsbnLabel: 'ISBN',
      copyrightNoticeText:
        'Alle Rechte vorbehalten. Kein Teil dieser Veröffentlichung darf ohne die vorherige schriftliche Genehmigung des Herausgebers in irgendeiner Form oder mit irgendwelchen Mitteln, einschließlich Fotokopieren, Aufzeichnen oder anderen elektronischen oder mechanischen Methoden, vervielfältigt, verbreitet oder übertragen werden.'
    },
    es: {
      tocHtmlHeading: 'ÍNDICE DE CONTENIDOS',
      tocMdHeading: '# Índice de Contenidos\n\n',

      // CLI Stats
      statsReportTitle: 'INFORME DE ESTADO DEL LIBRO',
      statsAuthor: 'Autor',
      statsSubtitle: 'Subtítulo',
      statsTheme: 'Tema',
      statsDraftStats: '[Estadísticas del Borrador]',
      statsTotalSections: 'Secciones Totales',
      statsTotalChapters: 'Capítulos Totales',
      statsTotalWords: 'Palabras Totales',
      statsTotalChars: 'Caracteres Totales',
      statsEstReadingTime: 'Tiempo estimado de lectura: {time} minutos',
      statsStructureBreakdown: '[Estructura Detallada]',
      statsSectionLabel: '\nSección {num}: "{title}" ({count} capítulos)',
      statsChapterLabel: '  - Capítulo {sec}.{chap} "{title}" ({words} palabras)',
      sectionLabel: 'Sección {num}',

      // CLI Check/Lint
      checkRunning: 'Ejecutando diagnósticos del libro...',
      checkClean:
        '¡No se encontraron problemas de diagnóstico! El libro está limpio y listo para IA.',
      checkFinished:
        '\nDiagnóstico finalizado: {errors} errores, {warnings} advertencias encontradas.',

      // Linter messages
      linterEmpty: 'El capítulo está vacío o solo contiene un título.',
      linterUnclosedCode:
        'Contiene un bloque de código markdown sin cerrar (número impar de triples comillas invertidas).',
      linterBrokenLink: 'Enlace markdown interno roto: "{target}" no existe.',
      linterUnusedCitation:
        'El término de cita "{term}" está definido en la configuración pero nunca coincide con el contenido del libro.',

      // CLI Search
      searchRunning: 'Buscando "{query}"...',
      searchNoMatches: 'No se encontraron coincidencias.',
      searchFoundMatches: 'Se encontraron {count} coincidencias:',

      // CLI Build/Compiler
      buildLoadingConfig: 'Cargando configuración...',
      buildScanning: 'Escaneando archivos de origen...',
      buildCompiling: 'Compilando libro...',
      buildSuccess: '¡Libro y metadatos de IA compilados con éxito!',
      buildPdfSkip: 'Generación de PDF omitida (deshabilitada en la configuración).',
      buildGeneratingPdf: 'Generando salida PDF: {path}...',
      buildGeneratingEpub: 'Generando salida EPUB: {path}...',
      buildEpubSkip: 'Generación de EPUB omitida (deshabilitada en la configuración).',

      // CLI Management
      managerSectionCreated:
        '✔ Directorio de sección {sectionNum} creado y titulado "{title}" en la configuración.',
      managerChapterCreated: '✔ Capítulo creado en: {filePath}',
      managerChapterMoved: '✔ Capítulo movido de {fromPath} a {toPath}',
      managerChapterDeleted: '✔ Capítulo eliminado: {filePath}',
      managerSynopsisUpdated: '✔ La sinopsis del capítulo {coords} ha sido actualizada.',
      managerTitleUpdated: '✔ El título en {filePath} ha sido actualizado a "{title}".',
      devServerStarting: 'Iniciando servidor de desarrollo...',
      devServerCompiling: 'Cambio detectado. Recompilando...',
      devServerReady:
        'Servidor de vista previa listo. Abra http://localhost:{port}/ en su navegador.',
      cliErrorFailedStartDevServer: 'Error al iniciar el servidor de desarrollo:',
      captureStarting: 'Generando capturas de pantalla...',
      captureSaved: 'Captura de pantalla guardada en: {path}',
      captureFailed: 'Error al capturar la pantalla: {error}',
      captureInvalidPage: 'Número de página inválido: {page}',
      captureEpubChapter: 'Capturando capítulo de EPUB: {coords}...',
      managerChapterTemplate:
        '# {title}\n\nEste es el capítulo {sectionNum}.{chapterNum} titulado "{title}". Complete el contenido.\n',
      initSuccessJson: 'book.json creado.',
      initSuccessChapters:
        'Directorios de capítulos de muestra y archivos markdown (assets/) creados.',
      initSuccessRun: '\n¡Éxito! Para compilar el libro, ejecute:\n  bitig build',
      initError: 'Error: Ocurrió un error al crear la plantilla:',
      cliErrorCompilationFailed: 'Compilación fallida:',
      cliErrorFailedAddSection: 'Error al agregar sección:',
      cliErrorFailedAddChapter: 'Error al agregar capítulo:',
      cliErrorFailedMoveChapter: 'Error al mover capítulo:',
      cliErrorFailedDeleteChapter: 'Error al eliminar capítulo:',
      cliErrorFailedLoadStats: 'Error al cargar estadísticas:',
      cliErrorFailedRunCheck: 'Error al ejecutar diagnósticos:',
      cliErrorFailedPackageContext: 'Error al empaquetar contexto:',
      cliErrorFailedSearch: 'Búsqueda fallida:',

      // Context Packager
      contextTitle: '# PAQUETE DE CONTEXTO DE ESCRITURA DEL LIBRO',
      contextIntro: 'Este paquete está compilado específicamente para escribir o refinar:',
      contextTargetChapter: '👉 **Sección {sec}, Capítulo {chap}**: "{title}"',
      contextMetadataHeader: '## 1. METADATOS GENERALES DEL LIBRO',
      contextBookTitle: 'Título',
      contextBookSubtitle: 'Subtítulo',
      contextBookAuthor: 'Autor',
      contextBookDescription: 'Descripción',
      contextBookTheme: 'Tema',
      contextStructureHeader: '## 2. ESTRUCTURA DEL LIBRO Y SINOPSIS',
      contextStructureIntro:
        'Aquí está el esquema del libro, incluyendo el primer párrafo (sinopsis) de cada capítulo:',
      contextStructureNoSynopsis: 'No hay sinopsis disponibles.',
      contextStructureNoContent: 'Aún no hay contenido.',
      contextStructureSection: '### Sección {sec}: {title}',
      contextStructureChapter: '  - Capítulo {sec}.{chap} "{title}": {synopsis}{marker}',
      contextGuidelinesHeader: '## 3. DIRECTRICES DE ESTILO Y REGLAS DE CITAS',
      contextGuidelinesIntro:
        'Aplique los siguientes términos automáticamente. El compilador los formateará como superíndice:',
      contextGuidelinesNoCitations: 'No hay citas definidas.',
      contextGuidelinesRule: '- Término: "{term}" -> Cita: "{replacement}"',
      contextPrecedingHeader: '## 4. CONTENIDO DEL CAPÍTULO ANTERIOR (Para el flujo narrativo)',
      contextPrecedingIntro:
        'Aquí está el texto completo del capítulo anterior (Capítulo {sec}.{chap} "{title}") para mantener el flujo narrativo y la consistencia de los personajes:',
      contextPrecedingNone: 'Este es el primer capítulo del libro. No existe un capítulo anterior.',
      contextTargetHeader: '## 5. CONTENIDO ACTUAL DEL CAPÍTULO DESTINO (Para editar o continuar)',
      contextTargetIntro:
        'Aquí está el contenido actual del capítulo destino. Amplíe, edite o reescriba esto:',
      contextTargetEmpty: 'El capítulo destino está actualmente vacío.',
      contextInstructionsHeader: '[INSTRUCCIONES PARA EL AGENTE DE IA]',
      contextInstruction1: '- Mantenga el estilo, vocabulario y tono del capítulo anterior.',
      contextInstruction2: '- No repita información que ya se haya cubierto en las sinopsis.',
      contextInstruction3: '- Integre los términos de cita de forma natural.',
      contextInstruction4: '- Devuelva ÚNICAMENTE texto markdown válido.',
      contextMemoryTitle: '## 🧠 MEMORIA PERSISTENTE DEL AGENTE E HISTORIAL DE RETROALIMENTACIÓN',
      contextMemoryIntro:
        'A continuación se presenta el historial de comentarios anteriores del usuario, decisiones estilísticas y rutinas de trabajo que debe cumplir. NO repita los errores del pasado documentados aquí:',
      contextMemoryGlobalLabel: 'Memoria Global / Nivel de Proyecto:',
      contextMemorySectionLabel: 'Memoria de la Sección {sec}:',
      contextMemoryChapterLabel: 'Memoria del Capítulo {coords}:',
      contextMemoryFeedbackLabel: 'Correcciones de Retroalimentación:',
      contextMemoryStyleLabel: 'Decisiones Estilísticas:',
      contextMemoryRoutineLabel: 'Rutinas y Reglas de Trabajo:',

      // Story Bible (Context Packager)
      contextStoryTitle: '## 📖 BIBLIA DE LA HISTORIA',
      contextStoryIntro:
        'A continuación se presentan los personajes, la línea temporal de la trama y los datos del mundo relevantes para este capítulo. Nunca contradiga esta información al escribir:',
      contextStoryCharactersHeader: 'Personajes en Escena',
      contextStoryRosterHeader: 'Reparto Completo (Compacto)',
      contextStoryTimelineHeader: 'Línea Temporal (Eventos Relevantes)',
      contextStoryThreadsHeader: 'Hilos Argumentales Abiertos',
      contextStoryWorldHeader: 'Referencia del Mundo',
      contextStoryRulesHeader: 'Reglas del Mundo (Obedecer Siempre)',
      contextStorySummaryLabel: 'Resumen',
      contextStoryStatusLabel: 'Estado',
      contextStoryBirthLabel: 'Nacimiento',
      contextStoryDeathLabel: 'Muerte',
      contextStoryPhysicalLabel: 'Físico',
      contextStoryPersonalityLabel: 'Personalidad',
      contextStorySpeechLabel: 'Estilo de Habla',
      contextStoryGoalsLabel: 'Objetivos',
      contextStoryRelationshipsLabel: 'Relaciones',
      contextStoryArcLabel: 'Arco del Personaje',
      contextStoryFirstAppearanceLabel: 'Primera Aparición',
      contextStoryIntroducedInLabel: 'Introducido En',
      contextInstruction5:
        '- Después de escribir, registre los nuevos eventos y cambios de personajes con `bitig add:event` / `bitig update:character` para mantener actualizada la biblia de la historia.',

      // Story CLI
      storyInitSuccess: '✔ {file} creado.',
      storyInitExists: '⚠ {file} ya existe, omitido (use --force para sobrescribir).',
      storyCharacterAdded: '✔ Personaje "{id}" añadido.',
      storyCharacterUpdated: '✔ Personaje "{id}" actualizado.',
      storyCharacterDeleted: '✔ Personaje "{id}" eliminado.',
      storyEventAdded: '✔ Evento "{id}" añadido.',
      storyEventUpdated: '✔ Evento "{id}" actualizado.',
      storyEventDeleted: '✔ Evento "{id}" eliminado.',
      storyThreadAdded: '✔ Hilo argumental "{id}" añadido.',
      storyThreadUpdated: '✔ Hilo argumental "{id}" actualizado.',
      storyThreadDeleted: '✔ Hilo argumental "{id}" eliminado.',
      storyWorldAdded: '✔ Entrada "{id}" añadida a "{category}".',
      storyWorldUpdated: '✔ Entrada "{id}" actualizada ({category}).',
      storyWorldDeleted: '✔ Entrada "{id}" eliminada ({category}).',
      storyListEmpty: 'No se encontraron registros.',
      storyTableId: 'ID',
      storyTableName: 'Nombre',
      storyTableRole: 'Rol',
      storyTableTitle: 'Título',
      storyTableDate: 'Fecha',
      storyTableOrder: 'Orden',
      storyTableChapters: 'Capítulos',
      storyTableStatus: 'Estado',
      storyTableCategory: 'Categoría',
      cliErrorFailedStoryCommand: 'El comando de historia falló:',

      // Story Linter
      storyLinterParseError: 'No se pudo analizar el archivo: {error}',
      storyLinterDuplicateId: 'ID duplicado: "{id}"',
      storyLinterDanglingRef: 'La referencia {refType} en "{owner}" no está definida: "{id}"',
      storyLinterUnknownCoords:
        '"{owner}" apunta a un capítulo que no existe en el libro: {coords}',
      storyLinterTimelineConflict:
        'Los eventos "{idA}" y "{idB}" tienen valores de fecha y orden contradictorios',
      storyLinterDuplicateOrder: 'El valor de orden {order} es usado por varios eventos: {ids}',
      storyLinterUnparseableDate:
        'El evento "{id}" tiene una fecha no analizable y ningún valor de orden: "{date}"',
      storyLinterNotBorn: 'El personaje "{character}" aún no ha nacido durante el evento "{event}"',
      storyLinterAlreadyDead:
        'El personaje "{character}" parece estar muerto durante el evento "{event}" (podría ser un flashback)',
      storyLinterAgeMismatch:
        'La edad del personaje "{character}" ({age}) contradice la fecha de nacimiento (esperado ~{expected})',
      storyLinterNonReciprocal:
        'El personaje "{a}" define una relación con "{b}" pero no hay una entrada recíproca',
      storyLinterUnusedEntity:
        '"{id}" ({name}) nunca aparece en ningún capítulo y no es referenciado por ningún evento',
      storyLinterPossibleUnregistered:
        'Posible nombre de personaje/lugar no registrado: "{word}" (aparece {count} veces)',
      // Context Task Modes
      taskContinueHeader: '📝 TAREA: CONTINUAR EL CAPÍTULO',
      taskContinue1:
        '- NO modifique el texto existente del capítulo; continúe desde donde termina.',
      taskContinue2:
        '- Arriba puede mostrarse solo el final del capítulo; retome el estilo y la escena desde allí.',
      taskContinue3:
        '- Termine el capítulo en un punto natural que no contradiga la sinopsis del siguiente capítulo.',
      taskRewriteHeader: '📝 TAREA: REESCRIBIR EL CAPÍTULO',
      taskRewrite1: '- Reescriba el capítulo de principio a fin conservando la misma trama.',
      taskRewrite2:
        '- Aplique con prioridad los comentarios y decisiones de estilo de la sección de memoria.',
      taskRewrite3: '- Mantenga el título del capítulo (H1); genere solo el nuevo texto markdown.',
      taskSummarizeHeader: '📝 TAREA: RESUMIR EL CAPÍTULO',
      taskSummarize1: '- Condense el capítulo objetivo en un resumen de 1-3 párrafos.',
      taskSummarize2:
        '- NO invente nuevos eventos ni diálogos; resuma solo el contenido existente.',
      taskSummarize3:
        '- El resumen se usará como sinopsis para futuros agentes de escritura (bitig update:metadata --synopsis).',
      taskExpandHeader: '📝 TAREA: AMPLIAR EL CAPÍTULO',
      taskExpand1:
        '- Enriquezca el texto con descripción, voz interior y detalles manteniendo las escenas existentes.',
      taskExpand2: '- NO cambie la trama ni el final del capítulo.',
      taskExpand3: '- Evite repeticiones de relleno que ralenticen el ritmo.',
      taskDialogueHeader: '📝 TAREA: NATURALIZAR EL DIÁLOGO',
      taskDialogue1:
        '- Mejore solo las líneas de diálogo; conserve los párrafos narrativos en lo posible.',
      taskDialogue2:
        '- Sea fiel al estilo de habla (speechStyle) de cada personaje según la biblia de la historia.',
      taskDialogue3:
        '- Acorte y naturalice los diálogos; integre la exposición dentro de la conversación.',
      taskStyleHeader: '📝 TAREA: TRANSFORMACIÓN DE ESTILO',
      taskStyle1: '- Reescriba el capítulo transformándolo al estilo "{target}".',
      taskStyle2: '- Mantenga exactamente la trama, los personajes y la estructura del capítulo.',
      taskStyle3:
        '- Adapte la elección de palabras, el ritmo de las frases y la voz narrativa al estilo objetivo.',
      taskPrecedingSkipped:
        '(El contenido del capítulo anterior se omite intencionadamente para la tarea de resumen.)',
      taskNextSynopsis: '➡️ Sinopsis del siguiente capítulo ({coords} "{title}"): {synopsis}',

      // Prose Analytics
      proseReportTitle: 'INFORME DE ANÁLISIS DE PROSA',
      proseTargetBook: 'Libro Completo',
      proseWords: 'Palabras',
      proseSentences: 'Oraciones',
      proseAvgSentence: 'Longitud media de oración (palabras)',
      proseAvgSyllables: 'Sílabas medias / palabra',
      proseDistribution:
        'Distribución de oraciones: {short} cortas / {medium} medias / {long} largas',
      proseLongest: 'Oración más larga (palabras)',
      proseLongSentences: 'Oraciones muy largas (>30 palabras)',
      proseDialogue: 'Líneas de diálogo / narración',
      proseReadability: 'Legibilidad ({formula}, aproximada)',
      proseReadabilityNone: 'sin contenido',
      proseReadabilityVeryEasy: 'muy fácil',
      proseReadabilityEasy: 'fácil',
      proseReadabilityMedium: 'media',
      proseReadabilityDifficult: 'difícil',
      proseRepeatedHeader: 'Palabras más repetidas',
      proseNoRepeats: 'No se encontró repetición significativa de palabras.',
      proseApproxNote:
        'Nota: La puntuación de legibilidad usa una fórmula aproximada según el idioma; no es una medición exacta.',

      // Writing Goals
      goalsUpdated: '✔ Objetivos de escritura guardados en book.json.',
      goalsSectionTitle: '[Objetivos de Escritura]',
      goalsTotalLabel: 'Objetivo total de palabras',
      goalsDailyLabel: 'Palabras de hoy',
      goalsChapterHeader: 'Objetivos por capítulo',
      goalsNoGoals:
        'No hay bloque "goals" definido en book.json. Ejemplo: bitig goals:set --total 80000 --daily 1000',
      goalsUnder: 'por debajo del objetivo',
      goalsOver: 'por encima del objetivo',
      goalsOk: 'dentro del rango objetivo',
      goalsBaselineNote: 'Primer registro de progreso (línea base) creado.',
      copyrightPageTitle: 'DERECHOS DE AUTOR',
      copyrightPublisherLabel: 'Editorial',
      copyrightPublishedLabel: 'Publicado',
      copyrightIsbnLabel: 'ISBN',
      copyrightNoticeText:
        'Todos los derechos reservados. Ninguna parte de esta publicación puede ser reproducida, distribuida o transmitida de ninguna forma ni por ningún medio, incluyendo fotocopias, grabaciones u otros métodos electrónicos o mecánicos, sin el permiso previo por escrito del editor.'
    },
    fr: {
      tocHtmlHeading: 'TABLE DES MATIÈRES',
      tocMdHeading: '# Table des Matières\n\n',

      // CLI Stats
      statsReportTitle: "RAPPORT D'ÉTAT DU LIVRE",
      statsAuthor: 'Auteur',
      statsSubtitle: 'Sous-titre',
      statsTheme: 'Thème',
      statsDraftStats: '[Statistiques du Brouillon]',
      statsTotalSections: 'Total des Sections',
      statsTotalChapters: 'Total des Chapitres',
      statsTotalWords: 'Total des Mots',
      statsTotalChars: 'Total des Caractères',
      statsEstReadingTime: 'Temps de lecture estimé: {time} minutes',
      statsStructureBreakdown: '[Détail de la Structure]',
      statsSectionLabel: '\nSection {num}: "{title}" ({count} chapitres)',
      statsChapterLabel: '  - Chapitre {sec}.{chap} "{title}" ({words} mots)',
      sectionLabel: 'Section {num}',

      // CLI Check/Lint
      checkRunning: 'Exécution des diagnostics du livre...',
      checkClean: "Aucun problème de diagnostic trouvé! Le livre est propre et prêt pour l'IA.",
      checkFinished: '\nDiagnostics terminés: {errors} erreurs, {warnings} avertissements trouvés.',

      // Linter messages
      linterEmpty: 'Le chapitre est vide ou contient seulement un titre.',
      linterUnclosedCode:
        'Le chapitre contient un bloc de code markdown non fermé (nombre impair de triples accents graves).',
      linterBrokenLink: 'Lien markdown interne brisé: "{target}" n\'existe pas.',
      linterUnusedCitation:
        'Le terme de citation "{term}" est défini dans la configuration mais ne correspond à aucun contenu du livre.',

      // CLI Search
      searchRunning: 'Recherche de "{query}"...',
      searchNoMatches: 'Aucun résultat trouvé.',
      searchFoundMatches: '{count} résultat(s) trouvé(s):',

      // CLI Build/Compiler
      buildLoadingConfig: 'Chargement de la configuration...',
      buildScanning: 'Analyse des fichiers sources...',
      buildCompiling: 'Compilation du livre...',
      buildSuccess: "Livre et métadonnées d'IA compilés avec succès!",
      buildPdfSkip: 'Génération du PDF ignorée (désactivée dans la configuration).',
      buildGeneratingPdf: 'Génération du PDF de sortie: {path}...',
      buildGeneratingEpub: 'Génération de la sortie EPUB: {path}...',
      buildEpubSkip: 'Génération EPUB ignorée (désactivée dans la configuration).',

      // CLI Management
      managerSectionCreated:
        '✔ Répertoire de section {sectionNum} créé et nommé "{title}" dans la configuration.',
      managerChapterCreated: "✔ Chapitre créé à l'adresse: {filePath}",
      managerChapterMoved: '✔ Chapitre déplacé de {fromPath} à {toPath}',
      managerChapterDeleted: '✔ Chapitre supprimé: {filePath}',
      managerSynopsisUpdated: '✔ La synopsis du chapitre {coords} a été mise à jour.',
      managerTitleUpdated: '✔ Le titre dans {filePath} a été mis à jour à "{title}".',
      devServerStarting: 'Démarrage du serveur de développement...',
      devServerCompiling: 'Changement détecté. Recompilation...',
      devServerReady:
        'Serveur de prévisualisation prêt. Ouvrez http://localhost:{port}/ dans votre navigateur.',
      cliErrorFailedStartDevServer: 'Échec du démarrage du serveur de développement:',
      captureStarting: "Génération des captures d'écran...",
      captureSaved: "Capture d'écran sauvegardée à l'emplacement: {path}",
      captureFailed: "Échec de la capture d'écran: {error}",
      captureInvalidPage: 'Numéro de page invalide: {page}',
      captureEpubChapter: 'Capture du chapitre EPUB: {coords}...',
      managerChapterTemplate:
        '# {title}\n\nCeci est le chapitre {sectionNum}.{chapterNum} nommé "{title}". Remplissez le contenu.\n',
      initSuccessJson: 'book.json créé.',
      initSuccessChapters:
        "Répertoires de chapitres d'exemple et fichiers markdown (assets/) créés.",
      initSuccessRun: '\nSuccès! Pour compiler le livre, lancez:\n  bitig build',
      initError: 'Erreur: Une erreur est survenue lors de la création du modèle:',
      cliErrorCompilationFailed: 'Échec de la compilation:',
      cliErrorFailedAddSection: "Échec de l'ajout de la section:",
      cliErrorFailedAddChapter: "Échec de l'ajout du chapitre:",
      cliErrorFailedMoveChapter: 'Échec du déplacement du chapitre:',
      cliErrorFailedDeleteChapter: 'Échec de la suppression du chapitre:',
      cliErrorFailedLoadStats: 'Échec du chargement des statistiques:',
      cliErrorFailedRunCheck: "Échec de l'exécution des diagnostics:",
      cliErrorFailedPackageContext: "Échec de l'empaquetage du contexte:",
      cliErrorFailedSearch: 'Échec de la recherche:',

      // Context Packager
      contextTitle: "# PACK DE CONTEXTE D'ÉCRITURE DU LIVRE",
      contextIntro: "Ce pack est compilé spécifiquement pour l'écriture ou l'affinage de:",
      contextTargetChapter: '👉 **Section {sec}, Chapitre {chap}**: "{title}"',
      contextMetadataHeader: '## 1. MÉTADONNÉES GÉNÉRALES DU LIVRE',
      contextBookTitle: 'Titre',
      contextBookSubtitle: 'Sous-titre',
      contextBookAuthor: 'Auteur',
      contextBookDescription: 'Description',
      contextBookTheme: 'Thème',
      contextStructureHeader: '## 2. STRUCTURE DU LIVRE & SYNOPSIS',
      contextStructureIntro:
        'Voici le plan du livre, incluant le premier paragraphe (synopsis) de chaque chapitre:',
      contextStructureNoSynopsis: 'Aucun synopsis disponible.',
      contextStructureNoContent: 'Aucun contenu pour le moment.',
      contextStructureSection: '### Section {sec}: {title}',
      contextStructureChapter: '  - Chapitre {sec}.{chap} "{title}": {synopsis}{marker}',
      contextGuidelinesHeader: '## 3. DIRECTIVES DE STYLE & RÈGLES DE CITATIONS',
      contextGuidelinesIntro:
        'Appliquez les termes suivants automatiquement. Le compilateur les formatera en exposant:',
      contextGuidelinesNoCitations: 'Aucune citation définie.',
      contextGuidelinesRule: '- Terme: "{term}" -> Citation: "{replacement}"',
      contextPrecedingHeader: '## 4. CONTENU DU CHAPITRE PRÉCÉDENT (Pour le flux narratif)',
      contextPrecedingIntro:
        'Voici le texte complet du chapitre précédent (Chapitre {sec}.{chap} "{title}") pour maintenir le flux narratif et la cohérence des personnages:',
      contextPrecedingNone:
        "Ceci est le premier chapitre du livre. Aucun chapitre précédent n'existe.",
      contextTargetHeader: '## 5. CONTENU ACTUEL DU CHAPITRE CIBLE (Pour modifier ou continuer)',
      contextTargetIntro:
        'Voici le contenu actuel du chapitre cible. Développez, modifiez ou réécrivez ceci:',
      contextTargetEmpty: 'Le chapitre cible est actuellement vide.',
      contextInstructionsHeader: "[INSTRUCTIONS POUR L'AGENT D'IA]",
      contextInstruction1: '- Maintenez le style, le vocabulaire et le ton du chapitre précédent.',
      contextInstruction2: '- Ne répétez pas les informations déjà couvertes dans les synopsis.',
      contextInstruction3: '- Intégrez les termes de citation naturellement.',
      contextInstruction4: '- Fournissez UNIQUEMENT du texte markdown valide.',
      contextMemoryTitle: "## 🧠 MÉMOIRE PERSISTANTE DE L'AGENT & HISTORIQUE DES RETOURS",
      contextMemoryIntro:
        "Ci-dessous se trouve l'historique des retours utilisateurs passés, des décisions stylistiques et des routines de travail que vous devez respecter. Ne répétez PAS les erreurs passées documentées ici:",
      contextMemoryGlobalLabel: 'Mémoire Globale / Niveau Projet:',
      contextMemorySectionLabel: 'Mémoire de la Section {sec}:',
      contextMemoryChapterLabel: 'Mémoire du Chapitre {coords}:',
      contextMemoryFeedbackLabel: 'Corrections des Retours:',
      contextMemoryStyleLabel: 'Décisions Stylistiques:',
      contextMemoryRoutineLabel: 'Routines & Règles de Travail:',

      // Story Bible (Context Packager)
      contextStoryTitle: "## 📖 BIBLE DE L'HISTOIRE",
      contextStoryIntro:
        "Ci-dessous se trouvent les personnages, la chronologie de l'intrigue et les faits du monde pertinents pour ce chapitre. Ne contredisez jamais ces informations en écrivant:",
      contextStoryCharactersHeader: 'Personnages Concernés',
      contextStoryRosterHeader: 'Distribution Complète (Compact)',
      contextStoryTimelineHeader: 'Chronologie (Événements Pertinents)',
      contextStoryThreadsHeader: 'Intrigues Ouvertes',
      contextStoryWorldHeader: 'Référence du Monde',
      contextStoryRulesHeader: 'Règles du Monde (Toujours Respecter)',
      contextStorySummaryLabel: 'Résumé',
      contextStoryStatusLabel: 'Statut',
      contextStoryBirthLabel: 'Naissance',
      contextStoryDeathLabel: 'Décès',
      contextStoryPhysicalLabel: 'Physique',
      contextStoryPersonalityLabel: 'Personnalité',
      contextStorySpeechLabel: 'Style de Parole',
      contextStoryGoalsLabel: 'Objectifs',
      contextStoryRelationshipsLabel: 'Relations',
      contextStoryArcLabel: 'Arc du Personnage',
      contextStoryFirstAppearanceLabel: 'Première Apparition',
      contextStoryIntroducedInLabel: 'Introduit Dans',
      contextInstruction5:
        "- Après l'écriture, enregistrez les nouveaux événements et changements de personnages avec `bitig add:event` / `bitig update:character` pour maintenir la bible de l'histoire à jour.",

      // Story CLI
      storyInitSuccess: '✔ {file} créé.',
      storyInitExists: '⚠ {file} existe déjà, ignoré (utilisez --force pour écraser).',
      storyCharacterAdded: '✔ Personnage "{id}" ajouté.',
      storyCharacterUpdated: '✔ Personnage "{id}" mis à jour.',
      storyCharacterDeleted: '✔ Personnage "{id}" supprimé.',
      storyEventAdded: '✔ Événement "{id}" ajouté.',
      storyEventUpdated: '✔ Événement "{id}" mis à jour.',
      storyEventDeleted: '✔ Événement "{id}" supprimé.',
      storyThreadAdded: '✔ Intrigue "{id}" ajoutée.',
      storyThreadUpdated: '✔ Intrigue "{id}" mise à jour.',
      storyThreadDeleted: '✔ Intrigue "{id}" supprimée.',
      storyWorldAdded: '✔ Entrée "{id}" ajoutée à "{category}".',
      storyWorldUpdated: '✔ Entrée "{id}" mise à jour ({category}).',
      storyWorldDeleted: '✔ Entrée "{id}" supprimée ({category}).',
      storyListEmpty: 'Aucun enregistrement trouvé.',
      storyTableId: 'ID',
      storyTableName: 'Nom',
      storyTableRole: 'Rôle',
      storyTableTitle: 'Titre',
      storyTableDate: 'Date',
      storyTableOrder: 'Ordre',
      storyTableChapters: 'Chapitres',
      storyTableStatus: 'Statut',
      storyTableCategory: 'Catégorie',
      cliErrorFailedStoryCommand: "Échec de la commande d'histoire:",

      // Story Linter
      storyLinterParseError: "Impossible d'analyser le fichier: {error}",
      storyLinterDuplicateId: 'ID en double: "{id}"',
      storyLinterDanglingRef: 'La référence {refType} dans "{owner}" n\'est pas définie: "{id}"',
      storyLinterUnknownCoords:
        '"{owner}" pointe vers un chapitre qui n\'existe pas dans le livre: {coords}',
      storyLinterTimelineConflict:
        'Les événements "{idA}" et "{idB}" ont des valeurs de date et d\'ordre contradictoires',
      storyLinterDuplicateOrder:
        "La valeur d'ordre {order} est utilisée par plusieurs événements: {ids}",
      storyLinterUnparseableDate:
        'L\'événement "{id}" a une date non analysable et aucune valeur d\'ordre: "{date}"',
      storyLinterNotBorn:
        'Le personnage "{character}" n\'est pas encore né lors de l\'événement "{event}"',
      storyLinterAlreadyDead:
        'Le personnage "{character}" semble être mort lors de l\'événement "{event}" (peut être un flashback)',
      storyLinterAgeMismatch:
        'L\'âge du personnage "{character}" ({age}) contredit la date de naissance (attendu ~{expected})',
      storyLinterNonReciprocal:
        'Le personnage "{a}" définit une relation avec "{b}" mais il n\'y a pas d\'entrée réciproque',
      storyLinterUnusedEntity:
        '"{id}" ({name}) n\'apparaît dans aucun chapitre et n\'est référencé par aucun événement',
      storyLinterPossibleUnregistered:
        'Nom de personnage/lieu possiblement non enregistré: "{word}" (apparaît {count} fois)',
      // Context Task Modes
      taskContinueHeader: '📝 TÂCHE: CONTINUER LE CHAPITRE',
      taskContinue1:
        "- Ne modifiez PAS le texte existant du chapitre; continuez là où il s'arrête.",
      taskContinue2:
        '- Seule la fin du chapitre peut être affichée ci-dessus; reprenez le style et la scène à partir de là.',
      taskContinue3:
        '- Terminez le chapitre à un point naturel qui ne contredit pas le synopsis du chapitre suivant.',
      taskRewriteHeader: '📝 TÂCHE: RÉÉCRIRE LE CHAPITRE',
      taskRewrite1: '- Réécrivez le chapitre du début à la fin en conservant la même intrigue.',
      taskRewrite2:
        '- Appliquez en priorité les retours et décisions stylistiques de la section mémoire.',
      taskRewrite3:
        '- Conservez le titre du chapitre (H1); ne produisez que le nouveau texte markdown.',
      taskSummarizeHeader: '📝 TÂCHE: RÉSUMER LE CHAPITRE',
      taskSummarize1: '- Condensez le chapitre cible en un résumé de 1 à 3 paragraphes.',
      taskSummarize2:
        "- N'inventez PAS de nouveaux événements ou dialogues; résumez uniquement le contenu existant.",
      taskSummarize3:
        "- Le résumé servira de synopsis aux futurs agents d'écriture (bitig update:metadata --synopsis).",
      taskExpandHeader: '📝 TÂCHE: DÉVELOPPER LE CHAPITRE',
      taskExpand1:
        '- Enrichissez le texte avec descriptions, voix intérieure et détails en gardant les scènes existantes.',
      taskExpand2: "- Ne changez PAS l'intrigue ni la fin du chapitre.",
      taskExpand3: '- Évitez les répétitions de remplissage qui ralentiraient le rythme.',
      taskDialogueHeader: '📝 TÂCHE: NATURALISER LES DIALOGUES',
      taskDialogue1:
        '- Améliorez uniquement les répliques; préservez autant que possible les paragraphes narratifs.',
      taskDialogue2:
        "- Restez fidèle au style de parole (speechStyle) de chaque personnage selon la bible de l'histoire.",
      taskDialogue3:
        "- Resserrez et naturalisez les dialogues; intégrez l'exposition dans la conversation.",
      taskStyleHeader: '📝 TÂCHE: TRANSFORMATION DE STYLE',
      taskStyle1: '- Réécrivez le chapitre transformé dans le style "{target}".',
      taskStyle2: "- Conservez exactement l'intrigue, les personnages et la structure du chapitre.",
      taskStyle3:
        '- Adaptez le choix des mots, le rythme des phrases et la voix du narrateur au style cible.',
      taskPrecedingSkipped:
        '(Le contenu du chapitre précédent est volontairement omis pour la tâche de résumé.)',
      taskNextSynopsis: '➡️ Synopsis du chapitre suivant ({coords} "{title}"): {synopsis}',

      // Prose Analytics
      proseReportTitle: "RAPPORT D'ANALYSE DE PROSE",
      proseTargetBook: 'Livre Entier',
      proseWords: 'Mots',
      proseSentences: 'Phrases',
      proseAvgSentence: 'Longueur moyenne de phrase (mots)',
      proseAvgSyllables: 'Syllabes moyennes / mot',
      proseDistribution:
        'Distribution des phrases: {short} courtes / {medium} moyennes / {long} longues',
      proseLongest: 'Phrase la plus longue (mots)',
      proseLongSentences: 'Phrases très longues (>30 mots)',
      proseDialogue: 'Lignes de dialogue / narration',
      proseReadability: 'Lisibilité ({formula}, approximative)',
      proseReadabilityNone: 'aucun contenu',
      proseReadabilityVeryEasy: 'très facile',
      proseReadabilityEasy: 'facile',
      proseReadabilityMedium: 'moyenne',
      proseReadabilityDifficult: 'difficile',
      proseRepeatedHeader: 'Mots les plus répétés',
      proseNoRepeats: 'Aucune répétition significative de mots trouvée.',
      proseApproxNote:
        "Remarque: Le score de lisibilité utilise une formule approximative selon la langue; ce n'est pas une mesure exacte.",

      // Writing Goals
      goalsUpdated: "✔ Objectifs d'écriture enregistrés dans book.json.",
      goalsSectionTitle: "[Objectifs d'Écriture]",
      goalsTotalLabel: 'Objectif total de mots',
      goalsDailyLabel: "Mots d'aujourd'hui",
      goalsChapterHeader: 'Objectifs par chapitre',
      goalsNoGoals:
        'Aucun bloc "goals" défini dans book.json. Exemple: bitig goals:set --total 80000 --daily 1000',
      goalsUnder: "en dessous de l'objectif",
      goalsOver: "au-dessus de l'objectif",
      goalsOk: "dans la plage de l'objectif",
      goalsBaselineNote: 'Première entrée de progression (référence) enregistrée.',
      copyrightPageTitle: "DROIT D'AUTEUR",
      copyrightPublisherLabel: 'Éditeur',
      copyrightPublishedLabel: 'Publié',
      copyrightIsbnLabel: 'ISBN',
      copyrightNoticeText:
        "Tous droits réservés. Aucune partie de cette publication ne peut être reproduite, distribuée ou transmise sous quelque forme ou par quelque moyen que ce soit, y compris la photocopie, l'enregistrement ou d'autres méthodes électroniques ou mécaniques, sans l'autorisation écrite préalable de l'éditeur."
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
    } else if (l.startsWith('es')) {
      normLang = 'es';
    } else if (l.startsWith('fr')) {
      normLang = 'fr';
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
