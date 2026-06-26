import { buildRef } from '../data/books';

/**
 * Map KJV navigator reference → OSHB/WLC Hebrew source reference.
 * Returns null when this KJV verse has no Hebrew counterpart in our data.
 */
export function resolveHebrewSourceRef(
  book: string,
  chapter: number,
  verse: number,
): string | null {
  // Daniel 4: KJV adds three prologue verses (1–3); Hebrew chapter starts at KJV 4:4.
  if (book === 'Daniel' && chapter === 4) {
    if (verse <= 3) return null;
    return buildRef(book, chapter, verse - 3);
  }

  return buildRef(book, chapter, verse);
}

/** True when displayed KJV verse number differs from the OSHB verse we load. */
export function usesAlternateHebrewNumbering(
  book: string,
  chapter: number,
  verse: number,
): boolean {
  const source = resolveHebrewSourceRef(book, chapter, verse);
  if (!source) return false;
  return source !== buildRef(book, chapter, verse);
}