import { parseRef, type ScriptureReference } from '../data/books';

export type AramaicScope = 'none' | 'full' | 'partial';

type VerseRange = {
  book: string;
  startChapter: number;
  startVerse: number;
  endChapter: number;
  endVerse: number;
};

/** Entire-verse Biblical Aramaic blocks in the OT (square script). */
const FULL_ARAMAIC_RANGES: VerseRange[] = [
  { book: 'Jeremiah', startChapter: 10, startVerse: 11, endChapter: 10, endVerse: 11 },
  { book: 'Ezra', startChapter: 4, startVerse: 8, endChapter: 6, endVerse: 18 },
  { book: 'Ezra', startChapter: 7, startVerse: 12, endChapter: 7, endVerse: 26 },
  { book: 'Daniel', startChapter: 2, startVerse: 5, endChapter: 7, endVerse: 28 },
];

const MIXED_VERSES = new Set([
  'Daniel 2:4',
  'Genesis 31:47',
  'Proverbs 31:2',
]);

function verseKey(book: string, chapter: number, verse: number): string {
  return `${book} ${chapter}:${verse}`;
}

function compareVerse(
  chapter: number,
  verse: number,
  refChapter: number,
  refVerse: number,
): number {
  if (chapter !== refChapter) return chapter - refChapter;
  return verse - refVerse;
}

function isInRange(book: string, chapter: number, verse: number, range: VerseRange): boolean {
  if (book !== range.book) return false;

  const afterStart =
    compareVerse(chapter, verse, range.startChapter, range.startVerse) >= 0;
  const beforeEnd =
    compareVerse(chapter, verse, range.endChapter, range.endVerse) <= 0;

  return afterStart && beforeEnd;
}

export function isFullAramaicVerse(book: string, chapter: number, verse: number): boolean {
  return FULL_ARAMAIC_RANGES.some((range) => isInRange(book, chapter, verse, range));
}

export function isMixedAramaicVerse(book: string, chapter: number, verse: number): boolean {
  return MIXED_VERSES.has(verseKey(book, chapter, verse));
}

export function getAramaicScope(book: string, chapter: number, verse: number): AramaicScope {
  if (isFullAramaicVerse(book, chapter, verse)) return 'full';
  if (isMixedAramaicVerse(book, chapter, verse)) return 'partial';
  return 'none';
}

export function getAramaicScopeFromRef(ref: string): AramaicScope {
  const { book, chapter, verse } = parseRef(ref);
  return getAramaicScope(book, chapter, verse);
}

/** Whether a specific interlinear word is Biblical Aramaic at this reference. */
export function isWordAramaic(
  book: string,
  chapter: number,
  verse: number,
  wordId: number,
  strongs?: string,
): boolean {
  if (isFullAramaicVerse(book, chapter, verse)) return true;

  const key = verseKey(book, chapter, verse);

  if (key === 'Daniel 2:4') {
    // Aramaic begins after "אֲרָמִית" (in Aramaic) — מַלְכָּא onward.
    return wordId >= 5;
  }

  if (key === 'Genesis 31:47') {
    return strongs === 'H3026';
  }

  if (key === 'Proverbs 31:2') {
    return strongs === 'H1248';
  }

  return false;
}

export function getAramaicScopeLabel(scope: AramaicScope): string | null {
  switch (scope) {
    case 'full':
      return 'Biblical Aramaic';
    case 'partial':
      return 'Mixed Hebrew & Aramaic';
    default:
      return null;
  }
}

export function getAramaicScopeHint(scope: AramaicScope): string | null {
  switch (scope) {
    case 'full':
      return 'This passage is written in Biblical Aramaic (square script). Strong’s numbers and pictographs still apply.';
    case 'partial':
      return 'Aramaic words in this verse are marked in a distinct typeface.';
    default:
      return null;
  }
}

export function aramaicScopeForRef(ref: ScriptureReference): AramaicScope {
  return getAramaicScope(ref.book, ref.chapter, ref.verse);
}