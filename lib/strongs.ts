// Strong's Dictionaries from openscriptures/strongs (CC-BY-SA)
// Hebrew and Greek combined for easy lookup by Hxxxx or Gxxxx

import { stripPoints } from './pictograph';

// @ts-ignore - JSON import
import hebrewRaw from '../data/strongs/strongs-hebrew.json';
// @ts-ignore
import greekRaw from '../data/strongs/strongs-greek.json';

export type StrongsEntry = {
  lemma?: string;
  xlit?: string;
  pron?: string;
  derivation?: string;
  strongs_def?: string;
  kjv_def?: string;
};

const strongsDict: Record<string, StrongsEntry> = {
  ...hebrewRaw,
  ...greekRaw,
};

export function getStrongs(code: string | null | undefined): StrongsEntry | null {
  if (!code) return null;
  const key = code.toUpperCase().trim();
  return strongsDict[key] || null;
}

export function getStrongsDef(code: string | null | undefined): string {
  const entry = getStrongs(code);
  if (!entry) return '';
  return entry.strongs_def || entry.kjv_def || '';
}

/** OSHB lemma codes (e.g. Hl, Hb) — prefixes/particles, not numbered Strong's entries. */
export function isMorphologicalStrongsCode(code: string | null | undefined): boolean {
  if (!code?.trim()) return false;
  const key = code.trim();
  return /^H[a-z]/i.test(key) && !/^H\d+$/i.test(key);
}

type MorphPrefix = {
  letter: string;
  name: string;
  gloss: string;
  pronBase: string;
};

const MORPH_PREFIXES: Record<string, MorphPrefix> = {
  Hl: { letter: 'ל', name: 'lamed', gloss: 'to, for, toward', pronBase: 'lə' },
  Hb: { letter: 'ב', name: 'beth', gloss: 'in, with, at, by', pronBase: 'bə' },
  Hm: { letter: 'מ', name: 'mem', gloss: 'from, out of', pronBase: 'mê' },
  'Hc/l': { letter: 'וְל', name: 'waw + lamed', gloss: 'and to / and for', pronBase: 'wə·lə' },
  'Hc/b': { letter: 'וּב', name: 'waw + beth', gloss: 'and in / and with', pronBase: 'ū·ḇə' },
  'Hc/m': { letter: 'וּמ', name: 'waw + mem', gloss: 'and from', pronBase: 'ū·mê' },
  Hk: { letter: 'כ', name: 'kaph', gloss: 'like, as, according to', pronBase: 'kə' },
  Hi: { letter: 'הֲ', name: 'interrogative he', gloss: 'question particle', pronBase: 'hă' },
  'Hi/l': {
    letter: 'הֲ…ל',
    name: 'interrogative + lamed',
    gloss: 'question with “to/for us”',
    pronBase: 'hă·lā',
  },
  'Hm/l': {
    letter: 'מ…ל',
    name: 'mem + lamed',
    gloss: 'from + to (combined form)',
    pronBase: '',
  },
  'Hs/l': {
    letter: 'שֶׁל',
    name: 'she + lamed',
    gloss: 'that/which belongs to',
    pronBase: 'she·l',
  },
};

type PronominalSuffix = { gloss: string; pron: string };

function detectPronominalSuffix(hebrew: string): PronominalSuffix | null {
  const bare = stripPoints(hebrew.replace(/\//g, ''));
  if (!bare) return null;

  if (/הון$|הום$|להון$|להום$/.test(bare)) {
    return { gloss: 'them (Aramaic plural)', pron: 'hôn' };
  }
  if (/ו$/.test(bare) && /[לבכ]/.test(bare)) return { gloss: 'him / his', pron: 'ō' };
  if (/ך$/.test(bare)) return { gloss: 'you (m. sing.)', pron: 'ḵā' };
  if (/כם$/.test(bare)) return { gloss: 'you (m. pl.)', pron: 'ḵem' };
  if (/כה$/.test(bare)) return { gloss: 'you (f. sing.)', pron: 'ḵā' };
  if (/נו$/.test(bare)) return { gloss: 'us / our', pron: 'nū' };
  if (/הם$|ם$/.test(bare)) return { gloss: 'them', pron: 'hem' };
  if (/ה$/.test(bare) && bare.length > 1) return { gloss: 'her / it (f.)', pron: 'āh' };
  if (/י$/.test(bare)) return { gloss: 'me / my', pron: 'ī' };

  return null;
}

export type StrongsDisplay = {
  pronunciation: string;
  definition: string;
  isFallback: boolean;
  fallbackKind?: 'morph' | 'missing';
};

/** Pronunciation + definition for UI, with OSHB morpheme fallbacks when Strong's has no entry. */
export function getStrongsDisplay(
  code: string | null | undefined,
  hebrew?: string,
): StrongsDisplay {
  const entry = getStrongs(code);
  const pronunciation = entry?.pron?.trim() || '';
  const definition = getStrongsDef(code);

  if (pronunciation || definition) {
    return { pronunciation, definition, isFallback: false };
  }

  const key = code?.trim() ?? '';
  const morph = MORPH_PREFIXES[key];
  if (morph) {
    const suffix = hebrew ? detectPronominalSuffix(hebrew) : null;
    const pron = suffix && morph.pronBase ? `${morph.pronBase}·${suffix.pron}` : morph.pronBase;
    const suffixNote = suffix
      ? ` with pronominal suffix (${suffix.gloss})`
      : ' (often with a pronominal suffix)';
    return {
      pronunciation: pron,
      definition:
        `OSHB morpheme: ${morph.letter} (${morph.name}) — ${morph.gloss}${suffixNote}. ` +
        'Hebrew prefixes and suffixes are tagged separately in the source text and have no numbered Strong\'s entry.',
      isFallback: true,
      fallbackKind: 'morph',
    };
  }

  if (key && /^H\d+$/i.test(key)) {
    return {
      pronunciation: '',
      definition:
        'No Strong\'s dictionary entry found for this reference.',
      isFallback: true,
      fallbackKind: 'missing',
    };
  }

  return { pronunciation: '', definition: '', isFallback: false };
}

/** Split Strong's kjv_def on commas not inside parentheses. */
function splitKjvPhrases(kjvDef: string): string[] {
  const phrases: string[] = [];
  let current = '';
  let depth = 0;

  for (const ch of kjvDef) {
    if (ch === '(') depth++;
    else if (ch === ')') depth = Math.max(0, depth - 1);

    if (ch === ',' && depth === 0) {
      if (current.trim()) phrases.push(current.trim());
      current = '';
      continue;
    }

    current += ch;
  }

  if (current.trim()) phrases.push(current.trim());
  return phrases;
}

function normalizeKjvPhrase(phrase: string): string {
  let text = phrase
    .replace(/\[idiom\]/gi, '')
    .replace(/\[phrase\]/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/\.$/, '')
    .trim();

  // "(make, put) difference" -> "difference"
  const verbAlternatives = text.match(/^\([^)]+\)\s+(.+)$/);
  if (verbAlternatives) text = verbAlternatives[1].trim();

  // "divide (asunder)" -> "divide"
  text = text.replace(/\s*\([^)]*\)\s*$/g, '').trim();

  return text;
}

/** Primary KJV English rendering(s) for a Strong's entry — first gloss phrase. */
export function getStrongsKjvGloss(code: string | null | undefined): string {
  const entry = getStrongs(code);
  if (!entry?.kjv_def?.trim()) return '';

  const phrases = splitKjvPhrases(entry.kjv_def);
  const normalized = phrases
    .map(normalizeKjvPhrase)
    .filter((phrase) => phrase && !/^unrepresented in english/i.test(phrase));

  // Prefer a gloss that does not start with a parenthetical prefix.
  for (let i = 0; i < phrases.length; i++) {
    const raw = phrases[i].replace(/\[idiom\]|\[phrase\]/gi, '').trim();
    if (!raw.startsWith('(') && normalized[i]) return normalized[i];
  }

  return normalized[0] || '';
}

export function getEnglishTranslation(word: {
  gloss?: string;
  strongs: string;
}): string {
  if (word.gloss?.trim()) return word.gloss.trim();
  return getStrongsKjvGloss(word.strongs);
}

// For display in UI
export function formatStrongs(entry: StrongsEntry | null): string {
  if (!entry) return '';
  const parts: string[] = [];
  if (entry.lemma) parts.push(entry.lemma);
  if (entry.xlit) parts.push(`(${entry.xlit})`);
  if (entry.pron) parts.push(entry.pron);
  if (entry.strongs_def) parts.push(entry.strongs_def);
  return parts.join(' — ');
}
