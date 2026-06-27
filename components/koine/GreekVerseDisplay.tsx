'use client';

import React, { useMemo } from 'react';
import type { GreekScriptureVerse } from '../../data/greek-nt';
import { useUserSettings } from '../UserSettingsContext';
import { getBlueLetterBibleVerseUrl } from '../../lib/blueletterbible';
import { getKjvJesusMask } from '../../lib/red-letter';

interface GreekVerseDisplayProps {
  verse: GreekScriptureVerse;
}

export function GreekVerseDisplay({ verse }: GreekVerseDisplayProps) {
  const { ntRedLetter } = useUserSettings();
  const blbUrl = getBlueLetterBibleVerseUrl(verse.book, verse.chapter, verse.verse);

  const kjvParts = useMemo(() => {
    const tokens = verse.kjv.match(/\S+|\s+/g) ?? [verse.kjv];
    const wordMask = getKjvJesusMask(verse, ntRedLetter);
    let wordIndex = 0;

    return tokens.map((token, index) => {
      const isWord = /\S/.test(token);
      const isJesus = isWord ? wordMask[wordIndex++] === true : false;
      return { key: index, token, isJesus, isWord };
    });
  }, [verse, ntRedLetter]);

  return (
    <div className="card p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-widest text-[var(--pw-text-faint)] mb-1">
            {verse.ref} · KJV
          </div>
          <div className="scripture-english text-[1.05rem] leading-snug text-[var(--pw-english)]">
            {kjvParts.map((part) =>
              part.isJesus ? (
                <span key={part.key} className="text-[var(--pw-jesus)] font-medium">
                  {part.token}
                </span>
              ) : (
                <span key={part.key}>{part.token}</span>
              ),
            )}
          </div>
        </div>
        <a
          href={blbUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] uppercase tracking-widest text-[var(--pw-accent-gold)] hover:underline shrink-0 pt-0.5"
          title="View this verse on Blue Letter Bible"
        >
          KJV
        </a>
      </div>
    </div>
  );
}