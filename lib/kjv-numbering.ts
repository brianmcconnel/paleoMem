import { buildRef, parseRef } from '../data/books';

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

/** Chapters where KJV and OSHB verse numbers are known to diverge. */
export const KNOWN_NUMBERING_AREAS: Array<{
  book: string;
  chapter: number;
  title: string;
  description: string;
  /** remap = explicit KJV→OSHB mapping; notice = same verse label, different breaks/content */
  mode: 'remap' | 'notice';
}> = [
  {
    book: 'Daniel',
    chapter: 4,
    title: 'Daniel 4',
    mode: 'remap',
    description:
      'KJV adds three opening verses (1–3) with no OSHB counterpart. KJV 4:4–37 align with OSHB 4:1–34.',
  },
  {
    book: 'Daniel',
    chapter: 5,
    title: 'Daniel 5',
    mode: 'remap',
    description: 'KJV splits the ending into two verses (30–31); OSHB combines this in 5:30.',
  },
  {
    book: 'Genesis',
    chapter: 31,
    title: 'Genesis 31',
    mode: 'remap',
    description: 'KJV 31:55 corresponds to OSHB 31:54.',
  },
  {
    book: 'Joel',
    chapter: 2,
    title: 'Joel 2',
    mode: 'remap',
    description: 'KJV 2:28–32 (Pentecost prophecy) are OSHB Joel 3:1–5.',
  },
  {
    book: 'Joel',
    chapter: 3,
    title: 'Joel 3',
    mode: 'remap',
    description: 'KJV Joel 3 is OSHB Joel 4 (Hebrew Bible chapter numbering).',
  },
  {
    book: 'Malachi',
    chapter: 4,
    title: 'Malachi 4',
    mode: 'remap',
    description: 'KJV Malachi 4 is OSHB Malachi 3:19–24 (one chapter in Hebrew).',
  },
  {
    book: 'Exodus',
    chapter: 8,
    title: 'Exodus 8',
    mode: 'notice',
    description: 'KJV and OSHB divide the plague narrative into different verse counts.',
  },
  {
    book: 'Leviticus',
    chapter: 6,
    title: 'Leviticus 6',
    mode: 'notice',
    description: 'KJV and OSHB divide the offerings section with different verse breaks.',
  },
  {
    book: 'Nehemiah',
    chapter: 4,
    title: 'Nehemiah 4',
    mode: 'notice',
    description: 'KJV and OSHB split Nehemiah’s wall narrative differently.',
  },
  {
    book: 'Ezekiel',
    chapter: 20,
    title: 'Ezekiel 20',
    mode: 'notice',
    description: 'KJV and OSHB diverge in verse numbering through this chapter.',
  },
  {
    book: 'Zechariah',
    chapter: 1,
    title: 'Zechariah 1',
    mode: 'notice',
    description: 'KJV and OSHB divide the opening vision with different verse breaks.',
  },
  {
    book: 'Hosea',
    chapter: 1,
    title: 'Hosea 1',
    mode: 'notice',
    description: 'KJV 1:10–11 are numbered differently in OSHB.',
  },
  {
    book: 'Job',
    chapter: 41,
    title: 'Job 41',
    mode: 'notice',
    description: 'KJV extends Leviathan’s description with verses not present in OSHB.',
  },
  {
    book: 'Psalms',
    chapter: 51,
    title: 'Psalms 51',
    mode: 'notice',
    description: 'OSHB includes superscription material as extra verses.',
  },
];

export function getChapterNumberingArea(book: string, chapter: number) {
  return KNOWN_NUMBERING_AREAS.find((area) => area.book === book && area.chapter === chapter);
}

/**
 * Map KJV navigator reference → OSHB/WLC Hebrew source reference.
 * Returns null when this KJV verse has no Hebrew counterpart in our data.
 */
export function resolveHebrewSourceRef(
  book: string,
  chapter: number,
  verse: number,
): string | null {
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

  return buildRef(book, chapter, verse);
}

function remappedSummary(book: string, chapter: number, verse: number, hebrewRef: string): string {
  const area = getChapterNumberingArea(book, chapter);
  if (area) return area.description;

  const { verse: hebrewVerse } = parseRef(hebrewRef);
  return `KJV ${book} ${chapter}:${verse} uses Hebrew from OSHB ${hebrewRef} (verse ${hebrewVerse}).`;
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
        ? area.description
        : 'This KJV verse has no matching OSHB Hebrew verse at this reference.',
    };
  }

  if (hebrewRef !== kjvRef) {
    return {
      kind: 'remapped',
      kjvRef,
      hebrewRef,
      summary: remappedSummary(book, chapter, verse, hebrewRef),
    };
  }

  const area = getChapterNumberingArea(book, chapter);
  if (area?.mode === 'notice') {
    return {
      kind: 'chapter-divergence',
      kjvRef,
      summary: area.description,
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