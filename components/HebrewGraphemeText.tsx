'use client';

import React from 'react';
import { graphemeConsonant, segmentHebrewGraphemes } from '../lib/hebrew-text';

interface HebrewGraphemeTextProps {
  text: string;
  selectedLetter?: string | null;
  /** When false, consonants are not clickable and selected letter is not highlighted. */
  interactive?: boolean;
  onConsonantClick?: (consonant: string) => void;
  highlightClassName?: string;
  consonantClassName?: string;
}

export function HebrewGraphemeText({
  text,
  selectedLetter = null,
  interactive = true,
  onConsonantClick,
  highlightClassName = 'letter-in-passage',
  consonantClassName = 'cursor-pointer hover:bg-[var(--pw-accent-gold)]/20 rounded-sm',
}: HebrewGraphemeTextProps) {
  const graphemes = segmentHebrewGraphemes(text);

  return (
    <span dir="rtl">
      {graphemes.map((grapheme, idx) => {
        const consonant = graphemeConsonant(grapheme);
        const isHighlighted = interactive && !!selectedLetter && consonant === selectedLetter;

        if (!consonant || !interactive) {
          return <span key={idx}>{grapheme}</span>;
        }

        return (
          <span
            key={idx}
            className={isHighlighted ? highlightClassName : consonantClassName}
            title={`Select letter ${consonant}`}
            onClick={
              onConsonantClick
                ? (e) => {
                    e.stopPropagation();
                    onConsonantClick(consonant);
                  }
                : undefined
            }
          >
            {grapheme}
          </span>
        );
      })}
    </span>
  );
}