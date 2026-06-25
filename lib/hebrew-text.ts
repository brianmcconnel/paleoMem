import { normalizeLetter, stripPoints } from './pictograph';

const HEBREW_LETTER = /[\u05D0-\u05EA]/;
const HEBREW_MARK = /[\u0591-\u05C7]/;

let graphemeSegmenter: Intl.Segmenter | null | undefined;

function getGraphemeSegmenter(): Intl.Segmenter | null {
  if (graphemeSegmenter !== undefined) return graphemeSegmenter;
  graphemeSegmenter =
    typeof Intl !== 'undefined' && 'Segmenter' in Intl
      ? new Intl.Segmenter('he', { granularity: 'grapheme' })
      : null;
  return graphemeSegmenter;
}

/** Split Hebrew text into display graphemes (base letter + attached points). */
export function segmentHebrewGraphemes(text: string): string[] {
  const normalized = text.replace(/\//g, '');
  if (!normalized) return [];

  const segmenter = getGraphemeSegmenter();
  if (segmenter) {
    return [...segmenter.segment(normalized)]
      .map((part) => part.segment)
      .filter((part) => part.length > 0);
  }

  const segments: string[] = [];
  let current = '';

  for (const ch of normalized) {
    if (HEBREW_LETTER.test(ch)) {
      if (current) segments.push(current);
      current = ch;
      continue;
    }

    if (HEBREW_MARK.test(ch) && current) {
      current += ch;
      continue;
    }

    if (current) {
      segments.push(current);
      current = '';
    }

    if (!/\s/.test(ch)) segments.push(ch);
  }

  if (current) segments.push(current);
  return segments;
}

/** Return the consonant key for a grapheme (final forms normalized). */
export function graphemeConsonant(grapheme: string): string | null {
  const bare = stripPoints(grapheme);
  for (const ch of bare) {
    const norm = normalizeLetter(ch);
    if (norm) return norm;
  }
  return null;
}