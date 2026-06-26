type KjvRow = { book: string; chapter: number; verse: number; text: string };

type HebrewRow = {
  ref: string;
  book: string;
  chapter: number;
  verse: number;
  kjv: string;
  hebrew: string;
  words: Array<{
    id: number;
    hebrew: string;
    strongs: string;
    transliteration?: string;
    gloss: string;
  }>;
};

let kjvData: KjvRow[] = [];
try {
  // @ts-ignore
  kjvData = require('./kjv.json');
} catch {
  /* optional at build time */
}

let hebrewData: HebrewRow[] = [];
try {
  // @ts-ignore
  hebrewData = require('./ot-hebrew.json');
} catch {
  /* optional at build time */
}

/** OSHB/morphhb marks morpheme boundaries with "/" — remove for display */
export function normalizeOshbHebrew(text: string): string {
  return text.replace(/\//g, '');
}

function normalizeHebrewVerse(v: HebrewRow): HebrewRow {
  return {
    ...v,
    hebrew: normalizeOshbHebrew(v.hebrew),
    words: v.words.map((w) => ({
      ...w,
      hebrew: normalizeOshbHebrew(w.hebrew),
    })),
  };
}

const hebrewLookup = new Map<string, HebrewRow>();
hebrewData.forEach((v) => hebrewLookup.set(v.ref, normalizeHebrewVerse(v)));

const kjvChapterVerseMax = new Map<string, number>();
const oshbChapterVerseMax = new Map<string, number>();

function recordMax(
  target: Map<string, number>,
  book: string,
  chapter: number,
  verse: number,
) {
  const key = `${book}:${chapter}`;
  const cur = target.get(key) || 0;
  if (verse > cur) target.set(key, verse);
}

kjvData.forEach((v) => recordMax(kjvChapterVerseMax, v.book, v.chapter, v.verse));
hebrewData.forEach((v) => recordMax(oshbChapterVerseMax, v.book, v.chapter, v.verse));

export function isKjvDataLoaded(): boolean {
  return kjvData.length > 0;
}

export function isHebrewDataLoaded(): boolean {
  return hebrewData.length > 0;
}

/** KJV is authoritative for navigation and verse picker bounds. */
export function getKjvMaxVerse(book: string, chapter: number): number {
  return kjvChapterVerseMax.get(`${book}:${chapter}`) || 0;
}

export function getOshbMaxVerse(book: string, chapter: number): number {
  return oshbChapterVerseMax.get(`${book}:${chapter}`) || 0;
}

export function hasKjvVerse(book: string, chapter: number, verse: number): boolean {
  return kjvData.some((v) => v.book === book && v.chapter === chapter && v.verse === verse);
}

export function hasHebrewVerseData(ref: string): boolean {
  return hebrewLookup.has(ref);
}

export function getHebrewVerse(ref: string): HebrewRow | undefined {
  return hebrewLookup.get(ref);
}

export function getKjvText(book: string, chapter: number, verse: number): string {
  if (kjvData.length === 0) {
    return 'KJV data not loaded. Run `npm run data:fetch` to retrieve from open source.';
  }
  const found = kjvData.find((v) => v.book === book && v.chapter === chapter && v.verse === verse);
  return found ? found.text : 'KJV text not available for this reference.';
}

export function getKjvRows(): readonly KjvRow[] {
  return kjvData;
}

export function getHebrewRows(): readonly HebrewRow[] {
  return hebrewData;
}