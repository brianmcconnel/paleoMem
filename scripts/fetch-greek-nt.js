const fs = require('fs');
const path = require('path');

const MORPHGNT_BASE =
  'https://raw.githubusercontent.com/morphgnt/sblgnt/master';
const OUTPUT = path.join(__dirname, '../data/nt-greek.json');
const ATTRIBUTION = path.join(__dirname, '../data/greek-source.txt');
const KJV_PATH = path.join(__dirname, '../data/kjv.json');
const STRONGS_GREEK_PATH = path.join(__dirname, '../data/strongs/strongs-greek.json');

const MORPH_BOOKS = {
  1: 'Matthew',
  2: 'Mark',
  3: 'Luke',
  4: 'John',
  5: 'Acts',
  6: 'Romans',
  7: '1 Corinthians',
  8: '2 Corinthians',
  9: 'Galatians',
  10: 'Ephesians',
  11: 'Philippians',
  12: 'Colossians',
  13: '1 Thessalonians',
  14: '2 Thessalonians',
  15: '1 Timothy',
  16: '2 Timothy',
  17: 'Titus',
  18: 'Philemon',
  19: 'Hebrews',
  20: 'James',
  21: '1 Peter',
  22: '2 Peter',
  23: '1 John',
  24: '2 John',
  25: '3 John',
  26: 'Jude',
  27: 'Revelation',
};

/** MorphGNT book files (61–87) in canonical NT order */
const MORPHGNT_FILES = [
  '61-Mt-morphgnt.txt',
  '62-Mk-morphgnt.txt',
  '63-Lk-morphgnt.txt',
  '64-Jn-morphgnt.txt',
  '65-Ac-morphgnt.txt',
  '66-Ro-morphgnt.txt',
  '67-1Co-morphgnt.txt',
  '68-2Co-morphgnt.txt',
  '69-Ga-morphgnt.txt',
  '70-Eph-morphgnt.txt',
  '71-Php-morphgnt.txt',
  '72-Col-morphgnt.txt',
  '73-1Th-morphgnt.txt',
  '74-2Th-morphgnt.txt',
  '75-1Ti-morphgnt.txt',
  '76-2Ti-morphgnt.txt',
  '77-Tit-morphgnt.txt',
  '78-Phm-morphgnt.txt',
  '79-Heb-morphgnt.txt',
  '80-Jas-morphgnt.txt',
  '81-1Pe-morphgnt.txt',
  '82-2Pe-morphgnt.txt',
  '83-1Jn-morphgnt.txt',
  '84-2Jn-morphgnt.txt',
  '85-3Jn-morphgnt.txt',
  '86-Jud-morphgnt.txt',
  '87-Re-morphgnt.txt',
];

const NT_KJV_KEYS = {
  Matthew: 'Book40',
  Mark: 'Book41',
  Luke: 'Book42',
  John: 'Book43',
  Acts: 'Book44',
  Romans: 'Book45',
  '1 Corinthians': 'Book46',
  '2 Corinthians': 'Book47',
  Galatians: 'Book48',
  Ephesians: 'Book49',
  Philippians: 'Book50',
  Colossians: 'Book51',
  '1 Thessalonians': 'Book52',
  '2 Thessalonians': 'Book53',
  '1 Timothy': 'Book54',
  '2 Timothy': 'Book55',
  Titus: 'Book56',
  Philemon: 'Book57',
  Hebrews: 'Book58',
  James: 'Book59',
  '1 Peter': 'Book60',
  '2 Peter': 'Book61',
  '1 John': 'Book62',
  '2 John': 'Book63',
  '3 John': 'Book64',
  Jude: 'Book65',
  Revelation: 'Book66',
};

function buildLemmaToStrongsMap() {
  const strongs = JSON.parse(fs.readFileSync(STRONGS_GREEK_PATH, 'utf8'));
  const map = new Map();

  for (const [code, entry] of Object.entries(strongs)) {
    const lemma = entry.lemma?.trim();
    if (!lemma) continue;
    if (!map.has(lemma)) map.set(lemma, code);
    const bare = lemma.normalize('NFD').replace(/\p{M}/gu, '');
    if (!map.has(bare)) map.set(bare, code);
  }

  return { map, strongs };
}

function firstKjvGloss(kjvDef) {
  if (!kjvDef) return '';
  const phrase = kjvDef.split(',')[0]?.trim() || '';
  return phrase.replace(/^\([^)]+\)\s*/, '').replace(/\s*\([^)]*\)$/, '').trim();
}

function parseMorphLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const ref = trimmed.slice(0, 6);
  if (!/^\d{6}$/.test(ref)) return null;

  const book = parseInt(ref.slice(0, 2), 10);
  const chapter = parseInt(ref.slice(2, 4), 10);
  const verse = parseInt(ref.slice(4, 6), 10);
  const rest = trimmed.slice(6).trim();
  const parts = rest.split(/\s+/);
  if (parts.length < 5) return null;

  const pos = parts[0];
  const parsing = parts[1];
  const text = parts[2];
  const word = parts[3];
  const normalized = parts[4];
  const lemma = parts.slice(5).join(' ') || parts[4];

  return { book, chapter, verse, pos, parsing, text, word, normalized, lemma };
}

function isWordToken(pos) {
  return pos && pos !== '--------' && !pos.startsWith('?');
}

async function fetchMorphFile(filename) {
  const url = `${MORPHGNT_BASE}/${filename}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  return res.text();
}

async function main() {
  console.log('Fetching MorphGNT SBLGNT edition (open source)…');

  const { map: lemmaToStrongs, strongs } = buildLemmaToStrongsMap();
  const kjvRows = JSON.parse(fs.readFileSync(KJV_PATH, 'utf8'));
  const kjvLookup = new Map();

  for (const row of kjvRows) {
    for (const [book, key] of Object.entries(NT_KJV_KEYS)) {
      if (row.book === key) {
        kjvLookup.set(`${book}:${row.chapter}:${row.verse}`, row.text);
      }
    }
  }

  const verses = new Map();
  let unmappedLemmas = 0;
  let totalWords = 0;

  for (const file of MORPHGNT_FILES) {
    console.log(`  ${file}`);
    const text = await fetchMorphFile(file);
    const lines = text.split('\n');

    for (const line of lines) {
      const parsed = parseMorphLine(line);
      if (!parsed) continue;

      const bookName = MORPH_BOOKS[parsed.book];
      if (!bookName) continue;

      const ref = `${bookName} ${parsed.chapter}:${parsed.verse}`;
      let verse = verses.get(ref);
      if (!verse) {
        verse = {
          ref,
          book: bookName,
          chapter: parsed.chapter,
          verse: parsed.verse,
          kjv: kjvLookup.get(`${bookName}:${parsed.chapter}:${parsed.verse}`) || '',
          greek: '',
          words: [],
          source:
            'MorphGNT SBLGNT Edition — Greek text © SBLGNT; morphology CC BY-SA 3.0',
        };
        verses.set(ref, verse);
      }

      if (!isWordToken(parsed.pos)) continue;

      const strongsCode =
        lemmaToStrongs.get(parsed.lemma) ||
        lemmaToStrongs.get(parsed.normalized) ||
        lemmaToStrongs.get(parsed.lemma.replace(/[,;.:!?·]/g, ''));

      if (!strongsCode) unmappedLemmas += 1;

      const entry = strongsCode ? strongs[strongsCode] : null;
      verse.words.push({
        id: verse.words.length + 1,
        greek: parsed.word,
        strongs: strongsCode || '',
        transliteration: entry?.translit || '',
        gloss: firstKjvGloss(entry?.kjv_def) || parsed.lemma,
      });
      totalWords += 1;
    }
  }

  for (const verse of verses.values()) {
    verse.greek = verse.words.map((w) => w.greek).join(' ');
  }

  const output = Array.from(verses.values()).sort((a, b) => {
    const bookOrder = Object.values(MORPH_BOOKS);
    const db = bookOrder.indexOf(a.book) - bookOrder.indexOf(b.book);
    if (db !== 0) return db;
    if (a.chapter !== b.chapter) return a.chapter - b.chapter;
    return a.verse - b.verse;
  });

  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 0));

  fs.writeFileSync(
    ATTRIBUTION,
    `koineHydata Greek New Testament data sources
==========================================

Greek text + morphology:
  MorphGNT: SBLGNT Edition (v6.12)
  https://github.com/morphgnt/sblgnt
  DOI: 10.5281/zenodo.376200

  - SBL Greek New Testament (SBLGNT) text — Society of Biblical Literature /
    Logos Bible Software. See https://sblgnt.com/ and the SBLGNT license.
  - Morphological parsing and lemmatization — CC BY-SA 3.0
    (https://creativecommons.org/licenses/by-sa/3.0/)

Strong's numbers:
  Mapped from Open Scriptures Strong's Greek dictionary
  https://github.com/openscriptures/strongs (CC BY-SA)

English (KJV):
  bibleapi/bibleapi-bibles-json (public domain)

Generated by: node scripts/fetch-greek-nt.js
`,
  );

  const j11 = output.find((v) => v.ref === 'John 1:1');
  console.log(`\nWrote ${OUTPUT}`);
  console.log(`  ${output.length} verses, ${totalWords} words`);
  console.log(`  ${unmappedLemmas} words without Strong's mapping`);
  if (j11) {
    console.log(`  John 1:1 sample: ${j11.words.length} words, ${j11.greek.slice(0, 50)}…`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});