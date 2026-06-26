const fs = require('fs');
const path = require('path');
const https = require('https');

const BSB_USFM_URL =
  'https://github.com/BSB-publishing/bsb2usfm/releases/download/v5.4/BSB_usfm.zip';
const ZIP_CACHE = path.join(__dirname, '../data/.cache/BSB_usfm.zip');
const OUTPUT = path.join(__dirname, '../data/nt-red-letter.json');
const GREEK_PATH = path.join(__dirname, '../data/nt-greek.json');
const ATTRIBUTION = path.join(__dirname, '../data/red-letter-source.txt');

const USFM_TO_BOOK = {
  MAT: 'Matthew',
  MRK: 'Mark',
  LUK: 'Luke',
  JHN: 'John',
  ACT: 'Acts',
  ROM: 'Romans',
  '1CO': '1 Corinthians',
  '2CO': '2 Corinthians',
  GAL: 'Galatians',
  EPH: 'Ephesians',
  PHP: 'Philippians',
  COL: 'Colossians',
  '1TH': '1 Thessalonians',
  '2TH': '2 Thessalonians',
  '1TI': '1 Timothy',
  '2TI': '2 Timothy',
  TIT: 'Titus',
  PHM: 'Philemon',
  HEB: 'Hebrews',
  JAS: 'James',
  '1PE': '1 Peter',
  '2PE': '2 Peter',
  '1JN': '1 John',
  '2JN': '2 John',
  '3JN': '3 John',
  JUD: 'Jude',
  REV: 'Revelation',
};

const NT_USFM_FILES = Object.keys(USFM_TO_BOOK);

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          return download(res.headers.location, dest).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          reject(new Error(`Download failed ${url}: ${res.statusCode}`));
          return;
        }
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      })
      .on('error', reject);
  });
}

function stripInlineUsfm(text) {
  return text
    .replace(/\\f\s[\s\S]*?\\f\*/g, '')
    .replace(/\\[a-z]+\d*\*?/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseRedLetterSegments(raw) {
  const parts = raw.split(/(\\wj\*?)/);
  const segments = [];
  let inJesus = false;
  let buffer = '';

  const flush = () => {
    const cleaned = stripInlineUsfm(buffer);
    if (cleaned) segments.push({ text: cleaned, isJesus: inJesus });
    buffer = '';
  };

  for (const part of parts) {
    if (part === '\\wj') {
      flush();
      inJesus = true;
      continue;
    }
    if (part === '\\wj*') {
      flush();
      inJesus = false;
      continue;
    }
    buffer += part;
  }
  flush();

  return segments.filter((s) => s.text.length > 0);
}

function allocateMask(segments, wordCount) {
  if (wordCount <= 0) return [];
  if (segments.length === 0) return Array(wordCount).fill(false);

  const totalChars =
    segments.reduce((sum, seg) => sum + seg.text.length, 0) || 1;
  const mask = [];
  let assigned = 0;

  for (let si = 0; si < segments.length; si += 1) {
    const seg = segments[si];
    const remaining = wordCount - assigned;
    const remainingSegs = segments.length - si;
    let count =
      si === segments.length - 1
        ? remaining
        : Math.round((seg.text.length / totalChars) * wordCount);
    count = Math.max(0, Math.min(count, remaining - (remainingSegs - 1)));

    for (let i = 0; i < count; i += 1) {
      mask.push(seg.isJesus);
      assigned += 1;
    }
  }

  while (mask.length < wordCount) mask.push(false);
  return mask.slice(0, wordCount);
}

function tokenizeWords(text) {
  return text.match(/\S+/g) ?? [];
}

function parseUsfmBook(usfm, bookName) {
  const verseRaw = new Map();
  let chapter = 1;
  let currentVerse = null;

  const appendText = (verse, text) => {
    if (!verse) return;
    const ref = `${bookName} ${chapter}:${verse}`;
    verseRaw.set(ref, (verseRaw.get(ref) || '') + text);
  };

  for (const line of usfm.split('\n')) {
    const chapterMatch = line.match(/^\\c\s+(\d+)/);
    if (chapterMatch) {
      chapter = parseInt(chapterMatch[1], 10);
      currentVerse = null;
      continue;
    }

    if (!line.includes('\\v ')) continue;

    const re = /\\v\s+(\d+)\s*/g;
    let match;
    let lastIndex = 0;

    while ((match = re.exec(line)) !== null) {
      if (currentVerse !== null && lastIndex < match.index) {
        appendText(currentVerse, line.slice(lastIndex, match.index));
      }
      currentVerse = parseInt(match[1], 10);
      lastIndex = match.index + match[0].length;
    }

    if (currentVerse !== null && lastIndex < line.length) {
      appendText(currentVerse, line.slice(lastIndex));
    }
  }

  const parsed = new Map();
  for (const [ref, raw] of verseRaw.entries()) {
    const segments = parseRedLetterSegments(raw);
    if (segments.some((s) => s.isJesus)) {
      parsed.set(ref, segments);
    }
  }
  return parsed;
}

async function readUsfmFromZip() {
  const cacheDir = path.dirname(ZIP_CACHE);
  fs.mkdirSync(cacheDir, { recursive: true });

  if (!fs.existsSync(ZIP_CACHE)) {
    console.log('Downloading BSB USFM (public domain)…');
    await download(BSB_USFM_URL, ZIP_CACHE);
  }

  const { execFileSync } = require('child_process');
  const allSegments = new Map();

  for (const file of NT_USFM_FILES) {
    const bookName = USFM_TO_BOOK[file];
    const usfm = execFileSync('unzip', ['-p', ZIP_CACHE, `${file}.usfm`], {
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    });
    const bookSegments = parseUsfmBook(usfm, bookName);
    for (const [ref, segments] of bookSegments.entries()) {
      allSegments.set(ref, segments);
    }
    console.log(`  ${file}.usfm — ${bookSegments.size} verses with words of Jesus`);
  }

  return allSegments;
}

async function main() {
  console.log('Building NT red-letter index from BSB USFM \\wj markers…');
  const segmentsByRef = await readUsfmFromZip();

  let greekByRef = new Map();
  if (fs.existsSync(GREEK_PATH)) {
    const greek = JSON.parse(fs.readFileSync(GREEK_PATH, 'utf8'));
    greekByRef = new Map(greek.map((v) => [v.ref, v]));
  }

  const output = {};
  let greekWordsMarked = 0;

  for (const [ref, segments] of segmentsByRef.entries()) {
    const greekVerse = greekByRef.get(ref);
    const greekMask = allocateMask(segments, greekVerse?.words?.length ?? 0);
    greekWordsMarked += greekMask.filter(Boolean).length;

    const kjvText = greekVerse?.kjv ?? '';
    const kjvMask = allocateMask(segments, tokenizeWords(kjvText).length);

    output[ref] = {
      ref,
      segments,
      greekMask,
      kjvMask,
    };
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(output));

  fs.writeFileSync(
    ATTRIBUTION,
    `koineHydata red-letter (words of Jesus) data source
=====================================================

Red-letter spans parsed from Berean Standard Bible USFM
  https://berean.bible/
  https://github.com/BSB-publishing/bsb2usfm

  - BSB text is public domain
  - \\wj ... \\wj* markers denote the words of Jesus

Word-level masks for Greek (SBLGNT) and KJV are approximated by
proportional alignment of BSB segments to each verse's word list.

Generated by: node scripts/fetch-red-letter.js
`,
  );

  console.log(`\nWrote ${OUTPUT}`);
  console.log(`  ${Object.keys(output).length} verses with Jesus speech`);
  console.log(`  ${greekWordsMarked} Greek words marked`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});