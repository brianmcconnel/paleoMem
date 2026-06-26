const path = require('path');
const jiti = require('jiti')(path.join(__dirname, 'verify-kjv-numbering.js'));

const { getVerse, getMaxVerse } = jiti('../data/verses.ts');
const { getNumberingStatus, resolveHebrewSourceRef } = jiti('../lib/kjv-hebrew-ref.ts');
const { getKjvMaxVerse, getOshbMaxVerse } = jiti('../data/scripture-index.ts');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function parseRef(ref) {
  const m = ref.match(/^(.+?) (\d+):(\d+)$/);
  assert(m, `bad ref ${ref}`);
  return { book: m[1], chapter: Number(m[2]), verse: Number(m[3]) };
}

function assertRemapped(kjvRef, hebrewRef) {
  const { book, chapter, verse } = parseRef(kjvRef);
  const st = getNumberingStatus(book, chapter, verse);
  assert(st.kind === 'remapped', `${kjvRef} should be remapped`);
  assert(st.hebrewRef === hebrewRef, `${kjvRef} → ${hebrewRef}`);
  assert(resolveHebrewSourceRef(book, chapter, verse) === hebrewRef, `resolve ${kjvRef}`);
}

function assertKjvOnly(kjvRef) {
  const { book, chapter, verse } = parseRef(kjvRef);
  const st = getNumberingStatus(book, chapter, verse);
  assert(st.kind === 'kjv-only', `${kjvRef} should be kjv-only`);
  assert(resolveHebrewSourceRef(book, chapter, verse) === null, `resolve ${kjvRef}`);
}

function assertHasHebrew(kjvRef) {
  const { book, chapter, verse } = parseRef(kjvRef);
  const verseData = getVerse(kjvRef);
  assert(verseData, `${kjvRef} loads`);
  assert(verseData.words.length > 0, `${kjvRef} has Hebrew words`);
}

// Daniel 4
assertRemapped('Daniel 4:35', 'Daniel 4:32');
assertRemapped('Daniel 4:4', 'Daniel 4:1');
assertKjvOnly('Daniel 4:3');
assertHasHebrew('Daniel 4:35');

// Other explicit remaps
assertRemapped('Daniel 5:31', 'Daniel 5:30');
assertRemapped('Genesis 31:55', 'Genesis 31:54');
assertRemapped('Joel 2:28', 'Joel 3:1');
assertRemapped('Joel 3:1', 'Joel 4:1');
assertRemapped('Malachi 4:1', 'Malachi 3:19');

// Chapter spill / prefix remaps
assertRemapped('Exodus 8:29', 'Exodus 9:1');
assertRemapped('Numbers 16:50', 'Numbers 17:15');
assertRemapped('Numbers 17:1', 'Numbers 17:16');
assertRemapped('1 Kings 4:21', '1 Kings 5:1');
assertRemapped('1 Kings 5:1', '1 Kings 5:15');
assertRemapped('Hosea 1:10', 'Hosea 2:1');
assertRemapped('Psalms 51:1', 'Psalms 51:3');
assertRemapped('Job 41:27', 'Job 42:1');
assertRemapped('Nehemiah 4:18', 'Nehemiah 5:1');
assertHasHebrew('Numbers 17:1');
assertHasHebrew('Psalms 51:1');

// KJV-authoritative navigation bounds
assert(getMaxVerse('Genesis', 32) === getKjvMaxVerse('Genesis', 32), 'Genesis 32 uses KJV max');
assert(getMaxVerse('Genesis', 32) < getOshbMaxVerse('Genesis', 32), 'Genesis 32 OSHB is longer');

console.log('KJV→OSHB numbering checks passed.');