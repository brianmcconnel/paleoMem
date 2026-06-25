import { normalizeLetter, stripPoints } from './pictograph';
import type { HebrewFontMode } from './site-cookies';

const HEBREW_LETTER = /[\u05D0-\u05EA]/;
const HEBREW_MARK = /[\u0591-\u05C7]/;

function getGraphemeSegmenter(): Intl.Segmenter | null {
  // Manual grapheme splitting only — Intl.Segmenter ICU data can differ between Node (SSR) and browsers.
  return null;
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

/** Pointed modern Hebrew, or consonant-only text for Paleo-Hebrew display. */
export function formatHebrewForDisplay(text: string, mode: HebrewFontMode = 'modern'): string {
  const normalized = text.replace(/\//g, '');
  if (mode === 'paleo') return stripPoints(normalized);
  return normalized;
}

/** Split text into render units — grapheme clusters (modern) or consonants (paleo). */
export function segmentHebrewForDisplay(
  text: string,
  mode: HebrewFontMode = 'modern',
): string[] {
  if (mode === 'paleo') return segmentHebrewConsonants(text);
  return segmentHebrewGraphemes(text);
}

/** Consonant-only segments after stripping vowel points and cantillation. */
export function segmentHebrewConsonants(text: string): string[] {
  const bare = formatHebrewForDisplay(text, 'paleo');
  const segments: string[] = [];

  for (const ch of bare) {
    if (/\s/.test(ch)) continue;
    segments.push(ch);
  }

  return segments;
}