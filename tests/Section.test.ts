import { Section } from '../src/Section';
import { Chapter } from '../src/Chapter';

describe('Section', () => {
  it('should hold section properties and allow adding chapters', () => {
    const section = new Section(2, 'The Machine Core');
    expect(section.sectionNum).toBe(2);
    expect(section.title).toBe('The Machine Core');
    expect(section.chapters.length).toBe(0);

    const chapter = new Chapter('assets/section-2/2.1.md', './assets');
    section.addChapter(chapter);
    expect(section.chapters.length).toBe(1);
    expect(section.chapters[0]).toBe(chapter);
  });

  it('should sort chapters correctly using chapter sort keys', () => {
    const section = new Section(1, 'Foundations');
    const chapter1 = new Chapter('assets/section-1/1.10.md', './assets');
    const chapter2 = new Chapter('assets/section-1/1.2.md', './assets');
    const chapter3 = new Chapter('assets/section-1/1.1.md', './assets');

    section.addChapter(chapter1);
    section.addChapter(chapter2);
    section.addChapter(chapter3);

    // Sort chapters
    section.sortChapters();

    expect(section.chapters[0]).toBe(chapter3); // 1.1
    expect(section.chapters[1]).toBe(chapter2); // 1.2
    expect(section.chapters[2]).toBe(chapter1); // 1.10
  });

  it('should sort chapters by filePath when chapterNum is identical', () => {
    const section = new Section(1, 'Foundations');
    const chapter1 = new Chapter('assets/section-1/1.1-b.md', './assets');
    const chapter2 = new Chapter('assets/section-1/1.1-a.md', './assets');

    chapter1.chapterNum = 1;
    chapter2.chapterNum = 1;

    section.addChapter(chapter1);
    section.addChapter(chapter2);

    section.sortChapters();

    // Alphabetically '1.1-a.md' comes before '1.1-b.md'
    expect(section.chapters[0]).toBe(chapter2);
    expect(section.chapters[1]).toBe(chapter1);
  });

  it('should fallback to default title if no title is provided', () => {
    const section = new Section(5);
    expect(section.title).toBe('Section 5');
  });
});
