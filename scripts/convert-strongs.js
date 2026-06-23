const fs = require('fs');
const path = require('path');

const HEBREW_JS = path.join(__dirname, '../data/strongs/strongs-hebrew-dictionary.js');
const GREEK_JS = path.join(__dirname, '../data/strongs/strongs-greek-dictionary.js');

const HEBREW_JSON = path.join(__dirname, '../data/strongs/strongs-hebrew.json');
const GREEK_JSON = path.join(__dirname, '../data/strongs/strongs-greek.json');

function convert(jsPath, jsonPath) {
  const content = fs.readFileSync(jsPath, 'utf8');
  // The file is basically: /* comments */ var dict = { ... }; module.exports = ...
  // We can eval in a safe way or use regex to extract the object.
  // Since it's trusted, we can use a Function or just require and export.
  
  // Better: temporarily require it as module
  const tempModule = { exports: {} };
  const script = new Function('module', 'exports', content.replace(/module\.exports\s*=\s*\w+;/, ''));
  // Actually simpler: since it sets module.exports at end, just require
  delete require.cache[require.resolve(jsPath)];
  const dict = require(jsPath);
  fs.writeFileSync(jsonPath, JSON.stringify(dict, null, 2));
  console.log(`Converted ${path.basename(jsPath)} -> ${path.basename(jsonPath)} (${Object.keys(dict).length} entries)`);
}

convert(HEBREW_JS, HEBREW_JSON);
convert(GREEK_JS, GREEK_JSON);

console.log('Strong\'s dictionaries converted to JSON.');