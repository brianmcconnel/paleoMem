export interface OtBook {
  name: string;
  chapters: number;
  order: number;
}

export const OT_BOOKS: OtBook[] = [
  { name: "Genesis", chapters: 50, order: 1 },
  { name: "Exodus", chapters: 40, order: 2 },
  { name: "Leviticus", chapters: 27, order: 3 },
  { name: "Numbers", chapters: 36, order: 4 },
  { name: "Deuteronomy", chapters: 34, order: 5 },
  { name: "Joshua", chapters: 24, order: 6 },
  { name: "Judges", chapters: 21, order: 7 },
  { name: "Ruth", chapters: 4, order: 8 },
  { name: "1 Samuel", chapters: 31, order: 9 },
  { name: "2 Samuel", chapters: 24, order: 10 },
  { name: "1 Kings", chapters: 22, order: 11 },
  { name: "2 Kings", chapters: 25, order: 12 },
  { name: "1 Chronicles", chapters: 29, order: 13 },
  { name: "2 Chronicles", chapters: 36, order: 14 },
  { name: "Ezra", chapters: 10, order: 15 },
  { name: "Nehemiah", chapters: 13, order: 16 },
  { name: "Esther", chapters: 10, order: 17 },
  { name: "Job", chapters: 42, order: 18 },
  { name: "Psalms", chapters: 150, order: 19 },
  { name: "Proverbs", chapters: 31, order: 20 },
  { name: "Ecclesiastes", chapters: 12, order: 21 },
  { name: "Song of Solomon", chapters: 8, order: 22 },
  { name: "Isaiah", chapters: 66, order: 23 },
  { name: "Jeremiah", chapters: 52, order: 24 },
  { name: "Lamentations", chapters: 5, order: 25 },
  { name: "Ezekiel", chapters: 48, order: 26 },
  { name: "Daniel", chapters: 12, order: 27 },
  { name: "Hosea", chapters: 14, order: 28 },
  { name: "Joel", chapters: 3, order: 29 },
  { name: "Amos", chapters: 9, order: 30 },
  { name: "Obadiah", chapters: 1, order: 31 },
  { name: "Jonah", chapters: 4, order: 32 },
  { name: "Micah", chapters: 7, order: 33 },
  { name: "Nahum", chapters: 3, order: 34 },
  { name: "Habakkuk", chapters: 3, order: 35 },
  { name: "Zephaniah", chapters: 3, order: 36 },
  { name: "Haggai", chapters: 2, order: 37 },
  { name: "Zechariah", chapters: 14, order: 38 },
  { name: "Malachi", chapters: 4, order: 39 },
];

export const OT_BOOK_NAMES = OT_BOOKS.map(b => b.name);

export function getBook(name: string): OtBook | undefined {
  return OT_BOOKS.find(b => b.name.toLowerCase() === name.toLowerCase());
}

export function getNextReference(book: string, chapter: number, verse: number): { book: string; chapter: number; verse: number } | null {
  const b = getBook(book);
  if (!b) return null;

  // Try next verse
  if (verse < 200) { // reasonable upper
    return { book, chapter, verse: verse + 1 };
  }
  // Next chapter
  if (chapter < b.chapters) {
    return { book, chapter: chapter + 1, verse: 1 };
  }
  // Next book
  const currentIndex = OT_BOOKS.findIndex(bb => bb.name === book);
  if (currentIndex < OT_BOOKS.length - 1) {
    const nextBook = OT_BOOKS[currentIndex + 1];
    return { book: nextBook.name, chapter: 1, verse: 1 };
  }
  return null;
}

export function getPrevReference(book: string, chapter: number, verse: number): { book: string; chapter: number; verse: number } | null {
  if (verse > 1) {
    return { book, chapter, verse: verse - 1 };
  }
  if (chapter > 1) {
    return { book, chapter: chapter - 1, verse: 50 }; // will be clamped by data lookup
  }
  const currentIndex = OT_BOOKS.findIndex(bb => bb.name === book);
  if (currentIndex > 0) {
    const prevBook = OT_BOOKS[currentIndex - 1];
    return { book: prevBook.name, chapter: prevBook.chapters, verse: 50 };
  }
  return null;
}
