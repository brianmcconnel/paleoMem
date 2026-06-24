/** Blue Letter Bible book slugs for KJV passage URLs */
const BLB_BOOK_SLUGS: Record<string, string> = {
  Genesis: 'gen',
  Exodus: 'exo',
  Leviticus: 'lev',
  Numbers: 'num',
  Deuteronomy: 'deu',
  Joshua: 'jos',
  Judges: 'jdg',
  Ruth: 'rut',
  '1 Samuel': '1sa',
  '2 Samuel': '2sa',
  '1 Kings': '1ki',
  '2 Kings': '2ki',
  '1 Chronicles': '1ch',
  '2 Chronicles': '2ch',
  Ezra: 'ezr',
  Nehemiah: 'neh',
  Esther: 'est',
  Job: 'job',
  Psalms: 'psa',
  Proverbs: 'pro',
  Ecclesiastes: 'ecc',
  'Song of Solomon': 'sng',
  Isaiah: 'isa',
  Jeremiah: 'jer',
  Lamentations: 'lam',
  Ezekiel: 'eze',
  Daniel: 'dan',
  Hosea: 'hos',
  Joel: 'joe',
  Amos: 'amo',
  Obadiah: 'oba',
  Jonah: 'jon',
  Micah: 'mic',
  Nahum: 'nah',
  Habakkuk: 'hab',
  Zephaniah: 'zep',
  Haggai: 'hag',
  Zechariah: 'zec',
  Malachi: 'mal',
};

/** Link to a KJV verse on Blue Letter Bible */
export function getBlueLetterBibleVerseUrl(
  book: string,
  chapter: number,
  verse: number,
  translation = 'kjv',
): string {
  const slug = BLB_BOOK_SLUGS[book];
  if (!slug) {
    const ref = `${book} ${chapter}:${verse}`;
    return `https://www.blueletterbible.org/search/search.cfm?q=${encodeURIComponent(ref)}&t=KJV`;
  }
  return `https://www.blueletterbible.org/${translation}/${slug}/${chapter}/${verse}/`;
}