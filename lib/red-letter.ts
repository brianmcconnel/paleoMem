import type { GreekInterlinearWord, GreekScriptureVerse } from '../data/greek-nt';

export function isJesusGreekWord(
  word: GreekInterlinearWord,
  redLetterEnabled = false,
): boolean {
  return redLetterEnabled && word.jesus === true;
}

export function getKjvJesusMask(
  verse: GreekScriptureVerse,
  redLetterEnabled = false,
): boolean[] {
  const tokens = verse.kjv.match(/\S+/g) ?? [];
  if (!redLetterEnabled) return tokens.map(() => false);
  const mask = verse.kjvJesusMask?.slice(0, tokens.length) ?? [];
  while (mask.length < tokens.length) mask.push(false);
  return mask;
}

export function verseHasRedLetter(
  verse: GreekScriptureVerse,
  redLetterEnabled = false,
): boolean {
  if (!redLetterEnabled) return false;
  if (verse.kjvJesusMask?.some(Boolean)) return true;
  return verse.words.some((w) => w.jesus);
}