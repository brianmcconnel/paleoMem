import { OT_BOOKS, parseRef } from '../data/books';
import { NT_BOOKS } from '../data/nt-books';

/** Canonical Bible book names in order (Genesis → Revelation). */
export const BIBLE_BOOK_NAMES: string[] = [
  ...OT_BOOKS.map((b) => b.name),
  ...NT_BOOKS.map((b) => b.name),
];

const BOOK_NAME_TO_NUM = new Map(
  BIBLE_BOOK_NAMES.map((name, index) => [name.toLowerCase(), index + 1]),
);

/** Compact verse ID: book×1_000_000 + chapter×1_000 + verse (e.g. Gen 1:1 → 1001001). */
export function refToVid(ref: string): number | null {
  const { book, chapter, verse } = parseRef(ref.trim());
  const bookNum = BOOK_NAME_TO_NUM.get(book.toLowerCase());
  if (!bookNum || !chapter || !verse) return null;
  return bookNum * 1_000_000 + chapter * 1_000 + verse;
}

export function vidToRef(vid: number): string {
  const bookNum = Math.floor(vid / 1_000_000);
  const chapter = Math.floor((vid % 1_000_000) / 1_000);
  const verse = vid % 1_000;
  const name = BIBLE_BOOK_NAMES[bookNum - 1] ?? `Book ${bookNum}`;
  return `${name} ${chapter}:${verse}`;
}

export function vidToBookNum(vid: number): number {
  return Math.floor(vid / 1_000_000);
}

export function isNewTestamentVid(vid: number): boolean {
  return vidToBookNum(vid) > OT_BOOKS.length;
}

/** OT verses use gold; NT verses use blue (site accent). */
export function verseAccentColor(vid: number): 'gold' | 'blue' {
  return isNewTestamentVid(vid) ? 'blue' : 'gold';
}