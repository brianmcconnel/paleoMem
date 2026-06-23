/**
 * Sample scripture data for paleoMem (MVP)
 * Now includes KJV + interlinear Hebrew with Strong's numbers.
 * Ready for richer data pipeline later.
 */

export type InterlinearWord = {
  id: number;
  hebrew: string;
  strongs: string; // e.g. "H7225"
  transliteration?: string;
  gloss: string; // Approximate KJV-aligned gloss
};

export type ScriptureVerse = {
  ref: string;
  book: string;
  chapter: number;
  verse: number;
  kjv: string;
  hebrew: string; // full pointed Hebrew for reference
  words: InterlinearWord[];
};

export const SAMPLE_VERSES: ScriptureVerse[] = [
  {
    ref: 'Genesis 1:1',
    book: 'Genesis',
    chapter: 1,
    verse: 1,
    kjv: 'In the beginning God created the heaven and the earth.',
    hebrew: 'בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ׃',
    words: [
      {
        id: 1,
        hebrew: 'בְּרֵאשִׁית',
        strongs: 'H7225',
        transliteration: 'bərēʾšîṯ',
        gloss: 'In the beginning',
      },
      { id: 2, hebrew: 'בָּרָא', strongs: 'H1254', transliteration: 'bārāʾ', gloss: 'created' },
      { id: 3, hebrew: 'אֱלֹהִים', strongs: 'H430', transliteration: 'ʾĕlōhîm', gloss: 'God' },
      { id: 4, hebrew: 'אֵת', strongs: 'H853', transliteration: 'ʾēṯ', gloss: '' },
      {
        id: 5,
        hebrew: 'הַשָּׁמַיִם',
        strongs: 'H8064',
        transliteration: 'haššāmayim',
        gloss: 'the heaven',
      },
      { id: 6, hebrew: 'וְאֵת', strongs: 'H853', transliteration: 'wəʾēṯ', gloss: 'and' },
      { id: 7, hebrew: 'הָאָרֶץ', strongs: 'H776', transliteration: 'hāʾāreṣ', gloss: 'the earth' },
    ],
  },
  {
    ref: 'Genesis 1:3',
    book: 'Genesis',
    chapter: 1,
    verse: 3,
    kjv: 'And God said, Let there be light: and there was light.',
    hebrew: 'וַיֹּאמֶר אֱלֹהִים יְהִי אוֹר וַיְהִי־אוֹר׃',
    words: [
      {
        id: 1,
        hebrew: 'וַיֹּאמֶר',
        strongs: 'H559',
        transliteration: 'wayyōʾmer',
        gloss: 'And said',
      },
      { id: 2, hebrew: 'אֱלֹהִים', strongs: 'H430', transliteration: 'ʾĕlōhîm', gloss: 'God' },
      { id: 3, hebrew: 'יְהִי', strongs: 'H1961', transliteration: 'yəhî', gloss: 'Let there be' },
      { id: 4, hebrew: 'אוֹר', strongs: 'H216', transliteration: 'ʾôr', gloss: 'light' },
      {
        id: 5,
        hebrew: 'וַיְהִי',
        strongs: 'H1961',
        transliteration: 'wayhî',
        gloss: 'and there was',
      },
      { id: 6, hebrew: 'אוֹר', strongs: 'H216', transliteration: 'ʾôr', gloss: 'light' },
    ],
  },
  {
    ref: 'Psalm 23:1',
    book: 'Psalms',
    chapter: 23,
    verse: 1,
    kjv: 'The LORD is my shepherd; I shall not want.',
    hebrew: 'מִזְמוֹר לְדָוִד יְהוָה רֹעִי לֹא אֶחְסָר׃',
    words: [
      { id: 1, hebrew: 'יְהוָה', strongs: 'H3068', transliteration: 'Yahweh', gloss: 'The LORD' },
      { id: 2, hebrew: 'רֹעִי', strongs: 'H7462', transliteration: 'rōʿî', gloss: 'my shepherd' },
      { id: 3, hebrew: 'לֹא', strongs: 'H3808', transliteration: 'lōʾ', gloss: 'not' },
      {
        id: 4,
        hebrew: 'אֶחְסָר',
        strongs: 'H2637',
        transliteration: 'ʾeḥsār',
        gloss: 'I shall want',
      },
    ],
  },
];

export const DEFAULT_VERSE = SAMPLE_VERSES[0];

// Fast lookup by reference string "Book Chapter:Verse"
const verseLookup = new Map<string, ScriptureVerse>();
SAMPLE_VERSES.forEach((v) => {
  verseLookup.set(v.ref, v);
  // Also support "Genesis 1:1" style
});

export function getVerse(ref: string): ScriptureVerse | undefined;
export function getVerse(book: string, chapter: number, verse: number): ScriptureVerse | undefined;
export function getVerse(refOrBook: string, chapter?: number, verse?: number): ScriptureVerse | undefined {
  let ref = refOrBook;
  let bookName = refOrBook;
  let ch = chapter;
  let v = verse;

  if (chapter !== undefined && verse !== undefined) {
    ref = `${refOrBook} ${chapter}:${verse}`;
    bookName = refOrBook;
    ch = chapter;
    v = verse;
  } else {
    const match = refOrBook.match(/^(.+?)\s+(\d+):(\d+)$/);
    if (match) {
      bookName = match[1];
      ch = parseInt(match[2]);
      v = parseInt(match[3]);
    } else {
      return undefined;
    }
  }

  // Prefer full open-source Hebrew + Strong's from OSHB
  const hebrewVerse = hebrewLookup.get(ref);
  if (hebrewVerse) {
    const kjvText = getKjvText(bookName, ch, v);
    return {
      ...hebrewVerse,
      kjv: kjvText || hebrewVerse.kjv || '',
    };
  }

  // Fallback to sample data if exists
  const sample = verseLookup.get(ref);
  if (sample) return sample;

  // Last resort: KJV only (no Hebrew/Strong's)
  const kjvText = getKjvText(bookName, ch, v);
  if (kjvText && kjvText.length > 10) {
    return {
      ref,
      book: bookName,
      chapter: ch,
      verse: v,
      kjv: kjvText,
      hebrew: '[Hebrew + Strong\'s not yet processed for this verse]',
      words: [],
    };
  }

  return undefined;
}

export function getAvailableRefs(): string[] {
  return Array.from(verseLookup.keys());
}

// Load KJV from open source (run `npm run data:fetch`)
let kjvData: Array<{book: string, chapter: number, verse: number, text: string}> = [];
try {
  // @ts-ignore
  kjvData = require('./kjv.json');
} catch (e) { }

/** OSHB/morphhb marks morpheme boundaries with "/" — remove for display */
export function normalizeOshbHebrew(text: string): string {
  return text.replace(/\//g, '');
}

function normalizeHebrewVerse(v: ScriptureVerse): ScriptureVerse {
  return {
    ...v,
    hebrew: normalizeOshbHebrew(v.hebrew),
    words: v.words.map((w) => ({
      ...w,
      hebrew: normalizeOshbHebrew(w.hebrew),
    })),
  };
}

// Load full Hebrew OT + Strong's from open source OSHB/morphhb
// (run `node scripts/fetch-hebrew-ot.js` )
let hebrewData: ScriptureVerse[] = [];
try {
  // @ts-ignore
  hebrewData = require('./ot-hebrew.json');
} catch (e) { }

const hebrewLookup = new Map<string, ScriptureVerse>();
hebrewData.forEach((v) => hebrewLookup.set(v.ref, normalizeHebrewVerse(v)));

const chapterVerseMax = new Map<string, number>();

function recordMax(book: string, chapter: number, verse: number) {
  const key = `${book}:${chapter}`;
  const cur = chapterVerseMax.get(key) || 0;
  if (verse > cur) chapterVerseMax.set(key, verse);
}

hebrewData.forEach(v => recordMax(v.book, v.chapter, v.verse));
kjvData.forEach(v => recordMax(v.book, v.chapter, v.verse));

export function getMaxVerse(book: string, chapter: number): number {
  const key = `${book}:${chapter}`;
  return chapterVerseMax.get(key) || 50; // safe fallback
}

export function getKjvText(book: string, chapter: number, verse: number): string {
  if (kjvData.length === 0) {
    return 'KJV data not loaded. Run `npm run data:fetch` to retrieve from open source.';
  }
  const found = kjvData.find(v => v.book === book && v.chapter === chapter && v.verse === verse);
  return found ? found.text : 'KJV text not available for this reference.';
}
