import { buildRef, parseRef, type ScriptureReference } from './books';
import { getKjvRows } from './scripture-index';

export type NtBook = {
  name: string;
  chapters: number;
  order: number;
  /** KJV JSON uses Book40–Book66 for NT until fetch script names are updated */
  kjvKey: string;
};

export const NT_BOOKS: NtBook[] = [
  { name: 'Matthew', chapters: 28, order: 1, kjvKey: 'Book40' },
  { name: 'Mark', chapters: 16, order: 2, kjvKey: 'Book41' },
  { name: 'Luke', chapters: 24, order: 3, kjvKey: 'Book42' },
  { name: 'John', chapters: 21, order: 4, kjvKey: 'Book43' },
  { name: 'Acts', chapters: 28, order: 5, kjvKey: 'Book44' },
  { name: 'Romans', chapters: 16, order: 6, kjvKey: 'Book45' },
  { name: '1 Corinthians', chapters: 16, order: 7, kjvKey: 'Book46' },
  { name: '2 Corinthians', chapters: 13, order: 8, kjvKey: 'Book47' },
  { name: 'Galatians', chapters: 6, order: 9, kjvKey: 'Book48' },
  { name: 'Ephesians', chapters: 6, order: 10, kjvKey: 'Book49' },
  { name: 'Philippians', chapters: 4, order: 11, kjvKey: 'Book50' },
  { name: 'Colossians', chapters: 4, order: 12, kjvKey: 'Book51' },
  { name: '1 Thessalonians', chapters: 5, order: 13, kjvKey: 'Book52' },
  { name: '2 Thessalonians', chapters: 3, order: 14, kjvKey: 'Book53' },
  { name: '1 Timothy', chapters: 6, order: 15, kjvKey: 'Book54' },
  { name: '2 Timothy', chapters: 4, order: 16, kjvKey: 'Book55' },
  { name: 'Titus', chapters: 3, order: 17, kjvKey: 'Book56' },
  { name: 'Philemon', chapters: 1, order: 18, kjvKey: 'Book57' },
  { name: 'Hebrews', chapters: 13, order: 19, kjvKey: 'Book58' },
  { name: 'James', chapters: 5, order: 20, kjvKey: 'Book59' },
  { name: '1 Peter', chapters: 5, order: 21, kjvKey: 'Book60' },
  { name: '2 Peter', chapters: 3, order: 22, kjvKey: 'Book61' },
  { name: '1 John', chapters: 5, order: 23, kjvKey: 'Book62' },
  { name: '2 John', chapters: 1, order: 24, kjvKey: 'Book63' },
  { name: '3 John', chapters: 1, order: 25, kjvKey: 'Book64' },
  { name: 'Jude', chapters: 1, order: 26, kjvKey: 'Book65' },
  { name: 'Revelation', chapters: 22, order: 27, kjvKey: 'Book66' },
];

const ntChapterVerseMax = new Map<string, number>();

for (const book of NT_BOOKS) {
  for (const row of getKjvRows()) {
    if (row.book !== book.kjvKey) continue;
    const key = `${book.name}:${row.chapter}`;
    const cur = ntChapterVerseMax.get(key) || 0;
    if (row.verse > cur) ntChapterVerseMax.set(key, row.verse);
  }
}

export function getNtBook(name: string): NtBook | undefined {
  return NT_BOOKS.find((b) => b.name.toLowerCase() === name.toLowerCase());
}

export function getNtMaxVerse(book: string, chapter: number): number {
  const key = `${book}:${chapter}`;
  const max = ntChapterVerseMax.get(key);
  if (max) return max;
  const info = getNtBook(book);
  return info ? 1 : 1;
}

export function getNextNtReference(
  book: string,
  chapter: number,
  verse: number,
): ScriptureReference | null {
  const b = getNtBook(book);
  if (!b) return null;

  const maxVerse = getNtMaxVerse(book, chapter);
  if (verse < maxVerse) return { book, chapter, verse: verse + 1 };
  if (chapter < b.chapters) return { book, chapter: chapter + 1, verse: 1 };

  const idx = NT_BOOKS.findIndex((bb) => bb.name === book);
  if (idx < NT_BOOKS.length - 1) {
    const next = NT_BOOKS[idx + 1];
    return { book: next.name, chapter: 1, verse: 1 };
  }
  return null;
}

export function getPrevNtReference(
  book: string,
  chapter: number,
  verse: number,
): ScriptureReference | null {
  if (verse > 1) return { book, chapter, verse: verse - 1 };
  if (chapter > 1) {
    const prevChapter = chapter - 1;
    return { book, chapter: prevChapter, verse: getNtMaxVerse(book, prevChapter) };
  }

  const idx = NT_BOOKS.findIndex((bb) => bb.name === book);
  if (idx > 0) {
    const prev = NT_BOOKS[idx - 1];
    const prevChapter = prev.chapters;
    return { book: prev.name, chapter: prevChapter, verse: getNtMaxVerse(prev.name, prevChapter) };
  }
  return null;
}

export function normalizeNtReference(ref: string): string {
  const parsed = parseRef(ref);
  const bookInfo = getNtBook(parsed.book);
  if (!bookInfo) return ref.trim();

  const chapter = Math.max(1, Math.min(parsed.chapter, bookInfo.chapters));
  const maxVerse = getNtMaxVerse(parsed.book, chapter);
  const verse = Math.max(1, Math.min(parsed.verse, maxVerse));
  return buildRef(parsed.book, chapter, verse);
}

export { buildRef, parseRef };