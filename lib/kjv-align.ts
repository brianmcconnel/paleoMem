import { InterlinearWord } from '../data/verses';
import { getEnglishTranslation } from './strongs';

export type KjvSegment = {
  wordId: number | null;
  text: string;
};

function rangesOverlap(
  a: { start: number; end: number },
  b: { start: number; end: number },
): boolean {
  return a.start < b.end && b.start < a.end;
}

/** Map KJV substrings to Hebrew interlinear words using gloss / Strong's hints. */
export function alignKjvToHebrewWords(kjv: string, words: InterlinearWord[]): KjvSegment[] {
  if (!kjv.trim() || words.length === 0) {
    return [{ wordId: null, text: kjv }];
  }

  const kjvLower = kjv.toLowerCase();
  const ranges: Array<{ wordId: number; start: number; end: number; len: number }> = [];

  for (const word of words) {
    const phrase = getEnglishTranslation(word);
    if (!phrase) continue;

    const idx = kjvLower.indexOf(phrase.toLowerCase());
    if (idx < 0) continue;

    const end = idx + phrase.length;
    const candidate = { wordId: word.id, start: idx, end, len: phrase.length };

    const conflict = ranges.find((r) => rangesOverlap(r, candidate));
    if (conflict) {
      if (candidate.len > conflict.len) {
        const i = ranges.indexOf(conflict);
        ranges[i] = candidate;
      }
      continue;
    }

    ranges.push(candidate);
  }

  ranges.sort((a, b) => a.start - b.start);

  const segments: KjvSegment[] = [];
  let pos = 0;

  for (const range of ranges) {
    if (range.start > pos) {
      segments.push({ wordId: null, text: kjv.slice(pos, range.start) });
    }
    segments.push({ wordId: range.wordId, text: kjv.slice(range.start, range.end) });
    pos = range.end;
  }

  if (pos < kjv.length) {
    segments.push({ wordId: null, text: kjv.slice(pos) });
  }

  if (segments.length === 0) {
    return [{ wordId: null, text: kjv }];
  }

  return segments;
}