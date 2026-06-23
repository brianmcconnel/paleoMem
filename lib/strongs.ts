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
