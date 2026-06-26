const {
  getAramaicScope,
  isWordAramaic,
  isFullAramaicVerse,
} = require('../lib/aramaic.ts');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(getAramaicScope('Jeremiah', 10, 11) === 'full', 'Jeremiah 10:11');
assert(getAramaicScope('Ezra', 5, 1) === 'full', 'Ezra 5:1');
assert(getAramaicScope('Ezra', 7, 20) === 'full', 'Ezra 7:20');
assert(getAramaicScope('Daniel', 3, 1) === 'full', 'Daniel 3:1');
assert(getAramaicScope('Daniel', 8, 1) === 'none', 'Daniel 8:1 Hebrew');
assert(getAramaicScope('Daniel', 2, 4) === 'partial', 'Daniel 2:4 mixed');
assert(getAramaicScope('Genesis', 31, 47) === 'partial', 'Genesis 31:47');
assert(getAramaicScope('Proverbs', 31, 2) === 'partial', 'Proverbs 31:2');

assert(!isWordAramaic('Daniel', 2, 4, 4, 'H762'), 'Daniel 2:4 word 4 Hebrew');
assert(isWordAramaic('Daniel', 2, 4, 5, 'H4430'), 'Daniel 2:4 word 5 Aramaic');
assert(isWordAramaic('Genesis', 31, 47, 4, 'H3026'), 'Genesis Jegar');
assert(!isWordAramaic('Genesis', 31, 47, 1, 'H7121'), 'Genesis Hebrew word');
assert(isWordAramaic('Proverbs', 31, 2, 2, 'H1248'), 'Proverbs bar');
assert(isFullAramaicVerse('Daniel', 7, 28), 'Daniel 7:28 end');

console.log('Aramaic scope checks passed.');