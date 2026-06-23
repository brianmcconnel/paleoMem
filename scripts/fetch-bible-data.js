const fs = require('fs');
const path = require('path');

async function fetchBibleData() {
  console.log('Fetching KJV data from open source (bibleapi/bibleapi-bibles-json)...');
  
  try {
    const kjvResponse = await fetch('https://raw.githubusercontent.com/bibleapi/bibleapi-bibles-json/master/kjv.json');
    const kjvData = await kjvResponse.json();
    
    // The structure is { resultset: { row: [ { field: [id, bookNum, chapter, verse, text] }, ... ] } }
    const verses = kjvData.resultset.row.map(row => {
      const [id, book, chapter, verse, text] = row.field;
      return {
        id,
        book: getBookName(book), // map number to name
        chapter,
        verse,
        text
      };
    });
    
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(dataDir, 'kjv.json'),
      JSON.stringify(verses, null, 2)
    );
    
    console.log(`KJV data saved to data/kjv.json with ${verses.length} verses`);
    
    // For Hebrew, we note the open source
    // Recommended: Open Scriptures Hebrew Bible (OSHB) https://github.com/openscriptures/morphhb
    // To get Hebrew + Strong's, you would parse the XML from the wlc folder.
    // For now, we save a note.
    fs.writeFileSync(
      path.join(dataDir, 'hebrew-source.txt'),
      `Hebrew text + Strong's should be sourced from Open Scriptures Hebrew Bible (OSHB):
https://github.com/openscriptures/morphhb

The wlc/ folder contains the XML with <w strong="Hxxxx"> tags.

To process:
1. Clone or download the morphhb repo.
2. Parse the XML per book to extract per verse and per word Hebrew + Strong's.
3. Generate the interlinear words array for the app format.

This script fetches the KJV as open source data.
For full integration, run a parser for morphhb to generate hebrew-interlinear.json or similar.
`
    );
    
    console.log('Note saved for Hebrew source (OSHB).');
    console.log('To get full Hebrew data, process the morphhb repo as described.');
    
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function getBookName(bookNum) {
  const books = {
    1: 'Genesis',
    2: 'Exodus',
    3: 'Leviticus',
    4: 'Numbers',
    5: 'Deuteronomy',
    6: 'Joshua',
    7: 'Judges',
    8: 'Ruth',
    9: '1 Samuel',
    10: '2 Samuel',
    11: '1 Kings',
    12: '2 Kings',
    13: '1 Chronicles',
    14: '2 Chronicles',
    15: 'Ezra',
    16: 'Nehemiah',
    17: 'Esther',
    18: 'Job',
    19: 'Psalms',
    20: 'Proverbs',
    21: 'Ecclesiastes',
    22: 'Song of Solomon',
    23: 'Isaiah',
    24: 'Jeremiah',
    25: 'Lamentations',
    26: 'Ezekiel',
    27: 'Daniel',
    28: 'Hosea',
    29: 'Joel',
    30: 'Amos',
    31: 'Obadiah',
    32: 'Jonah',
    33: 'Micah',
    34: 'Nahum',
    35: 'Habakkuk',
    36: 'Zephaniah',
    37: 'Haggai',
    38: 'Zechariah',
    39: 'Malachi'
  };
  return books[bookNum] || `Book${bookNum}`;
}

fetchBibleData();
