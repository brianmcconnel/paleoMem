const fs = require('fs');
const path = require('path');

const WLC_DIR = '/tmp/morphhb/wlc';
const OUTPUT = path.join(__dirname, '../data/ot-hebrew.json');

// Map from morphhb filenames to book names (matching our navigator)
const BOOK_MAP = {
  'Gen': 'Genesis',
  'Exod': 'Exodus',
  'Lev': 'Leviticus',
  'Num': 'Numbers',
  'Deut': 'Deuteronomy',
  'Josh': 'Joshua',
  'Judg': 'Judges',
  'Ruth': 'Ruth',
  '1Sam': '1 Samuel',
  '2Sam': '2 Samuel',
  '1Kgs': '1 Kings',
  '2Kgs': '2 Kings',
  '1Chr': '1 Chronicles',
  '2Chr': '2 Chronicles',
  'Ezra': 'Ezra',
  'Neh': 'Nehemiah',
  'Esth': 'Esther',
  'Job': 'Job',
  'Ps': 'Psalms',
  'Prov': 'Proverbs',
  'Eccl': 'Ecclesiastes',
  'Song': 'Song of Solomon',
  'Isa': 'Isaiah',
  'Jer': 'Jeremiah',
  'Lam': 'Lamentations',
  'Ezek': 'Ezekiel',
  'Dan': 'Daniel',
  'Hos': 'Hosea',
  'Joel': 'Joel',
  'Amos': 'Amos',
  'Obad': 'Obadiah',
  'Jonah': 'Jonah',
  'Mic': 'Micah',
  'Nah': 'Nahum',
  'Hab': 'Habakkuk',
  'Zeph': 'Zephaniah',
  'Hag': 'Haggai',
  'Zech': 'Zechariah',
  'Mal': 'Malachi'
};

/** OSHB/morphhb marks morpheme boundaries with "/" — remove for display */
function normalizeOshbHebrew(text) {
  return text.replace(/\//g, '');
}

function parseVerse(xmlSnippet, bookName) {
  // Extract osisID like "Gen.1.1"
  const osisMatch = xmlSnippet.match(/osisID="([^"]+)"/);
  if (!osisMatch) return null;
  const osis = osisMatch[1];
  const parts = osis.split('.');
  const chapter = parseInt(parts[1]);
  const verse = parseInt(parts[2]);

  // Extract all <w ...>text</w> and pull strong/lemma
  const wordRegex = /<w[^>]*?(?:strong="([^"]*)"|lemma="([^"]*)")[^>]*>([^<]+)<\/w>/g;
  const words = [];
  let hebrew = '';
  let match;

  while ((match = wordRegex.exec(xmlSnippet)) !== null) {
    let strong = match[1] || match[2] || '';
    let text = normalizeOshbHebrew(match[3].trim());

    // Extract number from lemma like "b/7225" or "1254 a" or "430"
    const numMatch = strong.match(/(\d+)/);
    if (numMatch) {
      strong = 'H' + numMatch[1];
    } else if (strong && !strong.startsWith('H')) {
      strong = 'H' + strong;
    }

    if (text) {
      words.push({
        id: words.length + 1,
        hebrew: text,
        strongs: strong || 'H0000'
      });
      hebrew += text + ' ';
    }
  }

  if (words.length === 0) return null;

  return {
    ref: `${bookName} ${chapter}:${verse}`,
    book: bookName,
    chapter,
    verse,
    hebrew: hebrew.trim(),
    words
  };
}

async function main() {
  console.log('Processing OSHB / morphhb for full Hebrew OT with Strong\'s...');

  const files = fs.readdirSync(WLC_DIR)
    .filter(f => f.endsWith('.xml'))
    .sort();

  const allVerses = [];

  for (const file of files) {
    const base = path.basename(file, '.xml');
    const bookName = BOOK_MAP[base];
    if (!bookName) {
      console.log('Skipping unknown book:', base);
      continue;
    }

    console.log('Processing', bookName);

    const xml = fs.readFileSync(path.join(WLC_DIR, file), 'utf8');

    // Split by <verse ...> ... </verse>
    const verseRegex = /<verse[^>]*osisID="[^"]*"[^>]*>[\s\S]*?<\/verse>/g;
    let vMatch;

    while ((vMatch = verseRegex.exec(xml)) !== null) {
      const verseXml = vMatch[0];
      const parsed = parseVerse(verseXml, bookName);
      if (parsed) {
        allVerses.push(parsed);
      }
    }
  }

  // Save as JSON for the app
  fs.writeFileSync(OUTPUT, JSON.stringify(allVerses, null, 2));
  console.log(`\nSaved ${allVerses.length} verses to ${OUTPUT}`);

  // Also update the app's verses loader if needed, but this gives the raw data.
  console.log('Done. You can now load from data/ot-hebrew.json in the app.');
}

main().catch(console.error);