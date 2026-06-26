import type { GreekInterlinearWord, GreekScriptureVerse } from '../data/greek-nt';

export function isJesusGreekWord(word: GreekInterlinearWord): boolean {
  return word.jesus === true;
}

export function getKjvJesusMask(verse: GreekScriptureVerse): boolean[] {
  const tokens = verse.kjv.match(/\S+/g) ?? [];
  const mask = verse.kjvJesusMask?.slice(0, tokens.length) ?? [];
  while (mask.length < tokens.length) mask.push(false);
  return mask;
}

export function verseHasRedLetter(verse: GreekScriptureVerse): boolean {
  if (verse.kjvJesusMask?.some(Boolean)) return true;
  return verse.words.some((w) => w.jesus);
}