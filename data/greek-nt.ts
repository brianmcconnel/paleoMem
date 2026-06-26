/**
 * New Testament Greek sample data (SBLGNT-aligned).
 * MVP: John 1:1 — expand via scripts/fetch-sblgnt.js
 */

import { parseRef } from './books';
import { getNtBook } from './nt-books';
import { getKjvRows } from './scripture-index';

export type GreekInterlinearWord = {
  id: number;
  greek: string;
  strongs: string;
  transliteration?: string;
  gloss: string;
};

export type GreekScriptureVerse = {
  ref: string;
  book: string;
  chapter: number;
  verse: number;
  kjv: string;
  greek: string;
  words: GreekInterlinearWord[];
  /** Text edition attribution */
  source: string;
};

export const JOHN_1_1: GreekScriptureVerse = {
  ref: 'John 1:1',
  book: 'John',
  chapter: 1,
  verse: 1,
  source: 'SBL Greek New Testament (SBLGNT)',
  kjv: 'In the beginning was the Word, and the Word was with God, and the Word was God.',
  greek:
    'Ἐν ἀρχῇ ἦν ὁ λόγος, καὶ ὁ λόγος ἦν πρὸς τὸν θεόν, καὶ θεός ἦν ὁ λόγος.',
  words: [
    { id: 1, greek: 'Ἐν', strongs: 'G1722', transliteration: 'en', gloss: 'In' },
    { id: 2, greek: 'ἀρχῇ', strongs: 'G746', transliteration: 'archē', gloss: 'the beginning' },
    { id: 3, greek: 'ἦν', strongs: 'G2258', transliteration: 'ēn', gloss: 'was' },
    { id: 4, greek: 'ὁ', strongs: 'G3588', transliteration: 'ho', gloss: 'the' },
    { id: 5, greek: 'λόγος', strongs: 'G3056', transliteration: 'lógos', gloss: 'Word' },
    { id: 6, greek: 'καὶ', strongs: 'G2532', transliteration: 'kai', gloss: 'and' },
    { id: 7, greek: 'ὁ', strongs: 'G3588', transliteration: 'ho', gloss: 'the' },
    { id: 8, greek: 'λόγος', strongs: 'G3056', transliteration: 'lógos', gloss: 'Word' },
    { id: 9, greek: 'ἦν', strongs: 'G2258', transliteration: 'ēn', gloss: 'was' },
    { id: 10, greek: 'πρὸς', strongs: 'G4314', transliteration: 'pros', gloss: 'with' },
    { id: 11, greek: 'τὸν', strongs: 'G3588', transliteration: 'ton', gloss: 'the' },
    { id: 12, greek: 'θεόν', strongs: 'G2316', transliteration: 'theón', gloss: 'God' },
    { id: 13, greek: 'καὶ', strongs: 'G2532', transliteration: 'kai', gloss: 'and' },
    { id: 14, greek: 'θεός', strongs: 'G2316', transliteration: 'theós', gloss: 'God' },
    { id: 15, greek: 'ἦν', strongs: 'G2258', transliteration: 'ēn', gloss: 'was' },
    { id: 16, greek: 'ὁ', strongs: 'G3588', transliteration: 'ho', gloss: 'the' },
    { id: 17, greek: 'λόγος', strongs: 'G3056', transliteration: 'lógos', gloss: 'Word' },
  ],
};

export const DEFAULT_KOINE_VERSE = JOHN_1_1;

const greekVerseLookup = new Map<string, GreekScriptureVerse>([[JOHN_1_1.ref, JOHN_1_1]]);

function getNtKjvText(book: string, chapter: number, verse: number): string {
  const ntBook = getNtBook(book);
  if (!ntBook) return '';
  const row = getKjvRows().find(
    (v) => v.book === ntBook.kjvKey && v.chapter === chapter && v.verse === verse,
  );
  return row?.text ?? '';
}

/** Load interlinear Greek when seeded; otherwise KJV-only shell for navigation. */
export function getGreekVerse(ref: string): GreekScriptureVerse | undefined {
  const trimmed = ref.trim();
  const loaded = greekVerseLookup.get(trimmed);
  if (loaded) return loaded;

  const { book, chapter, verse } = parseRef(trimmed);
  const kjv = getNtKjvText(book, chapter, verse);
  if (!kjv) return undefined;

  return {
    ref: trimmed,
    book,
    chapter,
    verse,
    kjv,
    greek: '',
    words: [],
    source: 'KJV (Greek interlinear not yet loaded for this verse)',
  };
}

export function getAvailableGreekRefs(): string[] {
  return Array.from(greekVerseLookup.keys());
}

export function getRandomKoineVerseRef(): string {
  const refs = getAvailableGreekRefs();
  if (refs.length === 0) return DEFAULT_KOINE_VERSE.ref;
  return refs[Math.floor(Math.random() * refs.length)];
}

export function hasGreekInterlinear(ref: string): boolean {
  return greekVerseLookup.has(ref.trim());
}