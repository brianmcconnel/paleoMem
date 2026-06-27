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

export function vidToChapterNum(vid: number): number {
  return Math.floor((vid % 1_000_000) / 1_000);
}

export function vidToVerseNum(vid: number): number {
  return vid % 1_000;
}

/** Chapter:verse label for graph nodes (e.g. 1001001 → "1:1"). */
export function vidToChapterVerse(vid: number): string {
  return `${vidToChapterNum(vid)}:${vidToVerseNum(vid)}`;
}

/** Pre-baked charset for deck.gl verse number labels. */
export const VERSE_LABEL_CHARACTER_SET = '0123456789';

/** Pre-baked charset for deck.gl chapter number labels. */
export const CHAPTER_LABEL_CHARACTER_SET = '0123456789';

const CHAPTER_VID_SCALE = 10_000;

/** Synthetic graph id for a chapter hub (negative, below book hub range). */
export function chapterToNodeVid(bookNum: number, chapter: number): number {
  return -(bookNum * CHAPTER_VID_SCALE + chapter);
}

export function verseToChapterNodeVid(verseVid: number): number {
  return chapterToNodeVid(vidToBookNum(verseVid), vidToChapterNum(verseVid));
}

/** Pre-baked charset for deck.gl book name labels. */
export const BOOK_LABEL_CHARACTER_SET = (() => {
  const chars = new Set<string>();
  for (const name of BIBLE_BOOK_NAMES) {
    for (const ch of name) chars.add(ch);
  }
  return [...chars].sort().join('');
})();

/** Synthetic graph id for a book hub node (negative to avoid verse id collisions). */
export function bookNumToNodeVid(bookNum: number): number {
  return -bookNum;
}

export function isChapterNodeVid(vid: number): boolean {
  return vid <= -CHAPTER_VID_SCALE;
}

export function isBookNodeVid(vid: number): boolean {
  return vid < 0 && vid > -CHAPTER_VID_SCALE;
}

export function isHubNodeVid(vid: number): boolean {
  return vid < 0;
}

export function bookNodeVidToBookNum(vid: number): number {
  return -vid;
}

export function chapterNodeVidToBookChapter(vid: number): { bookNum: number; chapter: number } {
  const code = -vid;
  return {
    bookNum: Math.floor(code / CHAPTER_VID_SCALE),
    chapter: code % CHAPTER_VID_SCALE,
  };
}

export function bookNumToBookName(bookNum: number): string {
  return BIBLE_BOOK_NAMES[bookNum - 1] ?? `Book ${bookNum}`;
}

export function vidToBookName(vid: number): string {
  return BIBLE_BOOK_NAMES[vidToBookNum(vid) - 1] ?? `Book ${vidToBookNum(vid)}`;
}

const BOOK_ABBREVIATIONS: Record<string, string> = {
  Genesis: 'Gen',
  Exodus: 'Exod',
  Leviticus: 'Lev',
  Numbers: 'Num',
  Deuteronomy: 'Deut',
  Joshua: 'Josh',
  Judges: 'Judg',
  Ruth: 'Ruth',
  '1 Samuel': '1 Sam',
  '2 Samuel': '2 Sam',
  '1 Kings': '1 Kgs',
  '2 Kings': '2 Kgs',
  '1 Chronicles': '1 Chr',
  '2 Chronicles': '2 Chr',
  Ezra: 'Ezra',
  Nehemiah: 'Neh',
  Esther: 'Esth',
  Job: 'Job',
  Psalms: 'Ps',
  Proverbs: 'Prov',
  Ecclesiastes: 'Eccl',
  'Song of Solomon': 'Song',
  Isaiah: 'Isa',
  Jeremiah: 'Jer',
  Lamentations: 'Lam',
  Ezekiel: 'Ezek',
  Daniel: 'Dan',
  Hosea: 'Hos',
  Joel: 'Joel',
  Amos: 'Amos',
  Obadiah: 'Obad',
  Jonah: 'Jonah',
  Micah: 'Mic',
  Nahum: 'Nah',
  Habakkuk: 'Hab',
  Zephaniah: 'Zeph',
  Haggai: 'Hag',
  Zechariah: 'Zech',
  Malachi: 'Mal',
  Matthew: 'Matt',
  Mark: 'Mark',
  Luke: 'Luke',
  John: 'John',
  Acts: 'Acts',
  Romans: 'Rom',
  '1 Corinthians': '1 Cor',
  '2 Corinthians': '2 Cor',
  Galatians: 'Gal',
  Ephesians: 'Eph',
  Philippians: 'Phil',
  Colossians: 'Col',
  '1 Thessalonians': '1 Thess',
  '2 Thessalonians': '2 Thess',
  '1 Timothy': '1 Tim',
  '2 Timothy': '2 Tim',
  Titus: 'Titus',
  Philemon: 'Phlm',
  Hebrews: 'Heb',
  James: 'Jas',
  '1 Peter': '1 Pet',
  '2 Peter': '2 Pet',
  '1 John': '1 Jn',
  '2 John': '2 Jn',
  '3 John': '3 Jn',
  Jude: 'Jude',
  Revelation: 'Rev',
};

export function bookAbbrev(bookName: string): string {
  return BOOK_ABBREVIATIONS[bookName] ?? bookName.slice(0, 4);
}

export function isNewTestamentVid(vid: number): boolean {
  return vidToBookNum(vid) > OT_BOOKS.length;
}

/** OT verses use gold; NT verses use blue (site accent). */
export function verseAccentColor(vid: number): 'gold' | 'blue' {
  return isNewTestamentVid(vid) ? 'blue' : 'gold';
}