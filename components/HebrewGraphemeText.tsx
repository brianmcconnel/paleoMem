'use client';

import React from 'react';
import { graphemeConsonant, segmentHebrewForDisplay } from '../lib/hebrew-text';
import { useHebrewFont } from './HebrewFontContext';

interface HebrewGraphemeTextProps {
  text: string;
  selectedLetter?: string | null;
  /** Biblical Aramaic words use a distinct open serif face in modern script mode. */
  script?: 'hebrew' | 'aramaic';
  /** When false, consonants are not clickable and selected letter is not highlighted. */
  interactive?: boolean;
  onConsonantClick?: (consonant: string) => void;
  highlightClassName?: string;
  consonantClassName?: string;
}

export function HebrewGraphemeText({
  text,
  selectedLetter = null,
  script = 'hebrew',
  interactive = true,
  onConsonantClick,
  highlightClassName = 'letter-in-passage',
  consonantClassName = 'cursor-pointer hover:bg-[var(--pw-accent-gold)]/20 rounded-sm',
}: HebrewGraphemeTextProps) {
  const { font } = useHebrewFont();
  const graphemes = segmentHebrewForDisplay(text, font);

  return (
    <span dir="rtl" className={script === 'aramaic' ? 'scripture-aramaic' : undefined}>
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