import { getGreekVerse } from '../data/greek-nt';
import { getVerse } from '../data/verses';
import { isNewTestamentVid, refToVid } from './verse-id';

export type CrossRefVerseText = {
  ref: string;
  testament: 'ot' | 'nt';
  kjv: string;
  original: string;
  originalKind: 'Hebrew' | 'Greek';
  missingOriginal: boolean;
};

export function getCrossRefVerseText(ref: string): CrossRefVerseText | null {
  const vid = refToVid(ref);
  const isNt = vid != null && isNewTestamentVid(vid);

  if (isNt) {
    const verse = getGreekVerse(ref);
    if (!verse?.kjv) return null;
    const greek = verse.greek.trim() || verse.words.map((w) => w.greek).join(' ').trim();
    return {
      ref: verse.ref,
      testament: 'nt',
      kjv: verse.kjv,
      original: greek,
      originalKind: 'Greek',
      missingOriginal: !greek,
    };
  }

  const verse = getVerse(ref);
  if (!verse?.kjv) return null;

  const hebrew = verse.hebrew.trim() || verse.words.map((w) => w.hebrew).join(' ').trim();
  return {
    ref: verse.ref,
    testament: 'ot',
    kjv: verse.kjv,
    original: hebrew,
    originalKind: 'Hebrew',
    missingOriginal: !hebrew,
  };
}