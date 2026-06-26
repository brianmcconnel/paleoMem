const path = require('path');
const jiti = require('jiti')(path.join(__dirname, 'verify-kjv-numbering.js'));

const { getVerse } = jiti('../data/verses.ts');
const { getNumberingStatus, resolveHebrewSourceRef } = jiti('../lib/kjv-hebrew-ref.ts');

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

function assertChapterNotice(kjvRef) {
  const { book, chapter, verse } = parseRef(kjvRef);
  const st = getNumberingStatus(book, chapter, verse);
  assert(st.kind === 'chapter-divergence', `${kjvRef} should show chapter notice`);
}

// Daniel 4
assertRemapped('Daniel 4:35', 'Daniel 4:32');
assertRemapped('Daniel 4:4', 'Daniel 4:1');
assertKjvOnly('Daniel 4:3');

const v35 = getVerse('Daniel 4:35');
assert(v35, 'Daniel 4:35 loads');
assert(v35.words.length > 0, 'Daniel 4:35 has words');
assert(v35.hebrewSourceRef === 'Daniel 4:32', 'tracks Hebrew source ref');
assert(v35.numberingStatus?.kind === 'remapped', 'Daniel 4:35 numbering status');

const v3 = getVerse('Daniel 4:3');
assert(v3, 'Daniel 4:3 loads');
assert(v3.words.length === 0, 'Daniel 4:3 has no Hebrew words');
assert(v3.numberingStatus?.kind === 'kjv-only', 'Daniel 4:3 numbering status');

// Other explicit remaps
assertRemapped('Daniel 5:31', 'Daniel 5:30');
assertRemapped('Genesis 31:55', 'Genesis 31:54');
assertRemapped('Joel 2:28', 'Joel 3:1');
assertRemapped('Joel 3:1', 'Joel 4:1');
assertRemapped('Malachi 4:1', 'Malachi 3:19');

// Notice-only chapters (same label, different breaks)
assertChapterNotice('Exodus 8:1');
assertChapterNotice('Psalms 51:1');

console.log('KJV→OSHB numbering checks passed.');