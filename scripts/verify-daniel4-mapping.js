const { getVerse } = require('../data/verses.ts');
const { resolveHebrewSourceRef } = require('../lib/kjv-hebrew-ref.ts');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(resolveHebrewSourceRef('Daniel', 4, 35) === 'Daniel 4:32', 'KJV 4:35 → OSHB 4:32');
assert(resolveHebrewSourceRef('Daniel', 4, 4) === 'Daniel 4:1', 'KJV 4:4 → OSHB 4:1');
assert(resolveHebrewSourceRef('Daniel', 4, 3) === null, 'KJV 4:3 has no OSHB verse');

const v35 = getVerse('Daniel 4:35');
assert(v35, 'Daniel 4:35 loads');
assert(v35.words.length > 0, 'Daniel 4:35 has words');
assert(v35.hebrewSourceRef === 'Daniel 4:32', 'tracks Hebrew source ref');
assert(v35.hebrew.includes('דארי') || v35.hebrew.includes('דָּיְרֵ'), 'Aramaic inhabitants text');

console.log('Daniel 4 KJV→OSHB mapping checks passed.');