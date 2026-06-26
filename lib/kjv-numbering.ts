import { buildRef, getBook } from '../data/books';
import {
  getKjvMaxVerse,
  getOshbMaxVerse,
  hasHebrewVerseData,
} from '../data/scripture-index';

export type NumberingStatus =
  | { kind: 'aligned' }
  | {
      kind: 'remapped';
      kjvRef: string;
      hebrewRef: string;
      summary: string;
    }
  | {
      kind: 'kjv-only';
      kjvRef: string;
      summary: string;
    }
  | {
      kind: 'chapter-divergence';
      kjvRef: string;
      summary: string;
    };

/** Chapters where KJV and OSHB divide text differently (for reader notices). */
export const KNOWN_NUMBERING_AREAS: Array<{
  book: string;
  chapter: number;
  title: string;
  description: string;
  /** remap = KJV→OSHB mapping applied; notice = same label, different verse breaks */
  mode: 'remap' | 'notice';
}> = [
  {
    book: 'Daniel',
    chapter: 4,
    title: 'Daniel 4',
    mode: 'remap',
    description:
      'KJV adds three opening verses (1–3) with no Hebrew counterpart. KJV 4:4–37 map to OSHB 4:1–34.',
  },
  {
    book: 'Daniel',
    chapter: 5,
    title: 'Daniel 5',
    mode: 'remap',
    description: 'KJV 5:31 continues the ending split from 5:30; OSHB combines both in 5:30.',
  },
  {
    book: 'Genesis',
    chapter: 31,
    title: 'Genesis 31',
    mode: 'remap',
    description: 'KJV 31:55 maps to OSHB 31:54.',
  },
  {
    book: 'Joel',
    chapter: 2,
    title: 'Joel 2',
    mode: 'remap',
    description: 'KJV 2:28–32 (Pentecost prophecy) map to OSHB Joel 3:1–5.',
  },
  {
    book: 'Joel',
    chapter: 3,
    title: 'Joel 3',
    mode: 'remap',
    description: 'KJV Joel 3 maps to OSHB Joel 4 (Hebrew Bible chapter numbering).',
  },
  {
    book: 'Malachi',
    chapter: 4,
    title: 'Malachi 4',
    mode: 'remap',
    description: 'KJV Malachi 4 maps to OSHB Malachi 3:19–24 (one chapter in Hebrew).',
  },
  {
    book: 'Exodus',
    chapter: 8,
    title: 'Exodus 8',
    mode: 'remap',
    description: 'KJV 8:29–32 spill into OSHB Exodus 9:1–4 after different plague verse breaks.',
  },
  {
    book: 'Leviticus',
    chapter: 6,
    title: 'Leviticus 6',
    mode: 'remap',
    description: 'KJV 6:24–30 spill into OSHB Leviticus 7 after different offering verse breaks.',
  },
  {
    book: 'Numbers',
    chapter: 16,
    title: 'Numbers 16',
    mode: 'remap',
    description: 'KJV 16:36–50 spill into OSHB Numbers 17:1–15.',
  },
  {
    book: 'Numbers',
    chapter: 17,
    title: 'Numbers 17',
    mode: 'remap',
    description: 'KJV 17:1–13 map to OSHB 17:16–28 after the chapter split.',
  },
  {
    book: 'Nehemiah',
    chapter: 4,
    title: 'Nehemiah 4',
    mode: 'remap',
    description: 'KJV 4:18–23 spill into OSHB Nehemiah 5 after different wall-narrative breaks.',
  },
  {
    book: 'Ezekiel',
    chapter: 20,
    title: 'Ezekiel 20',
    mode: 'remap',
    description: 'KJV 20:45–49 spill into OSHB Ezekiel 21:1–5.',
  },
  {
    book: 'Ezekiel',
    chapter: 21,
    title: 'Ezekiel 21',
    mode: 'remap',
    description: 'KJV 21:1–32 map to OSHB 21:6–37 after the prior chapter spill.',
  },
  {
    book: 'Hosea',
    chapter: 1,
    title: 'Hosea 1',
    mode: 'remap',
    description: 'KJV 1:10–11 spill into OSHB Hosea 2:1–2.',
  },
  {
    book: 'Job',
    chapter: 41,
    title: 'Job 41',
    mode: 'remap',
    description: 'KJV 41:27–34 spill into OSHB Job 42:1–8 (Leviathan / Behemoth split).',
  },
  {
    book: 'Psalms',
    chapter: 51,
    title: 'Psalms 51',
    mode: 'remap',
    description: 'OSHB includes superscription verses; KJV 51:1 maps to OSHB 51:3.',
  },
  {
    book: 'Zechariah',
    chapter: 1,
    title: 'Zechariah 1',
    mode: 'notice',
    description: 'KJV and OSHB divide the opening vision with different verse breaks.',
  },
];

export function getChapterNumberingArea(book: string, chapter: number) {
  return KNOWN_NUMBERING_AREAS.find((area) => area.book === book && area.chapter === chapter);
}

function tryHebrewRef(ref: string): string | null {
  return hasHebrewVerseData(ref) ? ref : null;
}

/** Rules that must run before a direct OSHB lookup (same ref can point at the wrong passage). */
function resolveExplicitHebrewRef(
  book: string,
  chapter: number,
  verse: number,
): string | null | undefined {
  if (book === 'Malachi' && chapter === 4) {
    return buildRef('Malachi', 3, verse + 18);
  }

  if (book === 'Joel' && chapter === 3) {
    return buildRef('Joel', 4, verse);
  }

  if (book === 'Joel' && chapter === 2 && verse >= 28) {
    return buildRef('Joel', 3, verse - 27);
  }

  if (book === 'Daniel' && chapter === 4) {
    if (verse <= 3) return null;
    return buildRef(book, chapter, verse - 3);
  }

  if (book === 'Daniel' && chapter === 5 && verse === 31) {
    return buildRef('Daniel', 5, 30);
  }

  if (book === 'Genesis' && chapter === 31 && verse === 55) {
    return buildRef('Genesis', 31, 54);
  }

  return undefined;
}

function resolveSpillEndRef(book: string, chapter: number, verse: number): string | null {
  const oshbMax = getOshbMaxVerse(book, chapter);
  if (oshbMax <= 0 || verse <= oshbMax) return null;

  const bookInfo = getBook(book);
  if (!bookInfo || chapter >= bookInfo.chapters) return null;

  return tryHebrewRef(buildRef(book, chapter + 1, verse - oshbMax));
}

function resolveSpillPrefixRef(book: string, chapter: number, verse: number): string | null {
  if (chapter <= 1) return null;

  const prevOshbMax = getOshbMaxVerse(book, chapter - 1);
  const prevKjvMax = getKjvMaxVerse(book, chapter - 1);
  if (prevOshbMax <= 0 || prevKjvMax <= prevOshbMax) return null;

  const spill = prevKjvMax - prevOshbMax;
  return tryHebrewRef(buildRef(book, chapter, verse + spill));
}

function resolvePsalmSuperscriptionRef(book: string, chapter: number, verse: number): string | null {
  if (book !== 'Psalms') return null;

  const kjvMax = getKjvMaxVerse(book, chapter);
  const oshbMax = getOshbMaxVerse(book, chapter);
  if (oshbMax <= kjvMax) return null;

  const offset = oshbMax - kjvMax;
  return tryHebrewRef(buildRef(book, chapter, verse + offset));
}

/**
 * Map authoritative KJV navigator reference → OSHB Hebrew source reference.
 * Returns null when this KJV verse has no Hebrew counterpart in our data.
 */
export function resolveHebrewSourceRef(
  book: string,
  chapter: number,
  verse: number,
): string | null {
  const explicit = resolveExplicitHebrewRef(book, chapter, verse);
  if (explicit !== undefined) return explicit;

  const spillEnd = resolveSpillEndRef(book, chapter, verse);
  if (spillEnd) return spillEnd;

  // Prefix before direct: OSHB may reuse lower verse numbers after a prior chapter spill.
  const spillPrefix = resolveSpillPrefixRef(book, chapter, verse);
  if (spillPrefix) return spillPrefix;

  const psalm = resolvePsalmSuperscriptionRef(book, chapter, verse);
  if (psalm) return psalm;

  const direct = buildRef(book, chapter, verse);
  const directHit = tryHebrewRef(direct);
  if (directHit) return directHit;

  return null;
}

function remappedSummary(
  book: string,
  chapter: number,
  kjvRef: string,
  hebrewRef: string,
): string {
  const area = getChapterNumberingArea(book, chapter);
  if (area) {
    return `paleoMem always navigates by KJV verse numbers. ${area.description}`;
  }

  return `paleoMem always navigates by KJV verse numbers. Hebrew for ${kjvRef} is loaded from OSHB ${hebrewRef} because verse breaks differ between KJV and the Hebrew Bible.`;
}

export function getNumberingStatus(book: string, chapter: number, verse: number): NumberingStatus {
  const kjvRef = buildRef(book, chapter, verse);
  const hebrewRef = resolveHebrewSourceRef(book, chapter, verse);

  if (!hebrewRef) {
    const area = getChapterNumberingArea(book, chapter);
    return {
      kind: 'kjv-only',
      kjvRef,
      summary: area
        ? `paleoMem always navigates by KJV verse numbers. ${area.description}`
        : `paleoMem always navigates by KJV verse numbers. ${kjvRef} has no matching OSHB Hebrew verse.`,
    };
  }

  if (hebrewRef !== kjvRef) {
    return {
      kind: 'remapped',
      kjvRef,
      hebrewRef,
      summary: remappedSummary(book, chapter, kjvRef, hebrewRef),
    };
  }

  const area = getChapterNumberingArea(book, chapter);
  if (area?.mode === 'notice') {
    return {
      kind: 'chapter-divergence',
      kjvRef,
      summary: `paleoMem always navigates by KJV verse numbers. OSHB uses the same verse label here, but ${area.description.toLowerCase()}`,
    };
  }

  return { kind: 'aligned' };
}

export function usesAlternateHebrewNumbering(
  book: string,
  chapter: number,
  verse: number,
): boolean {
  const source = resolveHebrewSourceRef(book, chapter, verse);
  if (!source) return false;
  return source !== buildRef(book, chapter, verse);
}