/**
 * New Testament Greek sample data (SBLGNT-aligned).
 * MVP: John 1:1 — expand via scripts/fetch-sblgnt.js
 */

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

const verseLookup = new Map<string, GreekScriptureVerse>([[JOHN_1_1.ref, JOHN_1_1]]);

export function getGreekVerse(ref: string): GreekScriptureVerse | undefined {
  return verseLookup.get(ref.trim());
}

export function getAvailableGreekRefs(): string[] {
  return Array.from(verseLookup.keys());
}