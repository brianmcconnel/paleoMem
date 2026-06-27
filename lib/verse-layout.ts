import { OT_BOOKS } from '../data/books';
import { getMaxVerse } from '../data/verses';
import { NT_BOOKS, getNtMaxVerse } from '../data/nt-books';
import { BIBLE_BOOK_NAMES, vidToBookNum } from './verse-id';

const CANONICAL_VIDS: number[] = buildCanonicalVids();
const VID_TO_INDEX = new Map(CANONICAL_VIDS.map((vid, index) => [vid, index]));

function buildCanonicalVids(): number[] {
  const vids: number[] = [];

  for (const book of OT_BOOKS) {
    for (let chapter = 1; chapter <= book.chapters; chapter += 1) {
      const maxVerse = getMaxVerse(book.name, chapter);
      for (let verse = 1; verse <= maxVerse; verse += 1) {
        vids.push(book.order * 1_000_000 + chapter * 1_000 + verse);
      }
    }
  }

  for (const book of NT_BOOKS) {
    const bookNum = book.order + 39;
    for (let chapter = 1; chapter <= book.chapters; chapter += 1) {
      const maxVerse = getNtMaxVerse(book.name, chapter);
      for (let verse = 1; verse <= maxVerse; verse += 1) {
        vids.push(bookNum * 1_000_000 + chapter * 1_000 + verse);
      }
    }
  }

  return vids;
}

const LAYOUT_RADIUS = 6;

/** Map a verse ID to [x, y] on a canonical circle (for deck.gl). */
export function vidToPosition(vid: number): [number, number] {
  const index = VID_TO_INDEX.get(vid);
  if (index == null) {
    const bookNum = vidToBookNum(vid);
    const fallback = (bookNum / BIBLE_BOOK_NAMES.length) * Math.PI * 2;
    return [Math.cos(fallback) * LAYOUT_RADIUS, Math.sin(fallback) * LAYOUT_RADIUS];
  }
  const theta = (index / CANONICAL_VIDS.length) * Math.PI * 2 - Math.PI / 2;
  return [Math.cos(theta) * LAYOUT_RADIUS, Math.sin(theta) * LAYOUT_RADIUS];
}

export function getCanonicalVerseCount(): number {
  return CANONICAL_VIDS.length;
}