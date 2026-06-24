// Strong's Dictionaries from openscriptures/strongs (CC-BY-SA)
// Hebrew and Greek combined for easy lookup by Hxxxx or Gxxxx

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
