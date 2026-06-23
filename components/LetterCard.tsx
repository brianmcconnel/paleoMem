'use client';

import React from 'react';
import { ParsedLetter } from '../lib/pictograph';

interface LetterCardProps {
  letter: ParsedLetter;
  showEmojis: boolean;
  isHighlighted?: boolean;
  onClick?: () => void;
}

export const LetterCard = React.forwardRef<HTMLButtonElement, LetterCardProps>(
  function LetterCard({ letter, showEmojis, isHighlighted, onClick }, ref) {
    const { info, normalized } = letter;

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={`letter-card shrink-0 w-[118px] text-left cursor-pointer ${
          isHighlighted
            ? 'border-[var(--pw-accent-gold)] ring-2 ring-[var(--pw-accent-gold)]/30 bg-[var(--pw-letter-bg)]'
            : ''
        }`}
      >
        <div className="letter text-[var(--pw-hebrew)] mb-1 text-center">{normalized}</div>
        <div className="text-[var(--pw-accent-gold)] font-medium text-sm mb-0.5 text-center">
          {info.name}
        </div>
        <div className="text-xs text-[var(--pw-emoji)] mb-1 text-center min-h-[1rem]">
          {showEmojis ? info.emoji : ''}
        </div>
        <div className="text-[10px] text-[var(--pw-text-faint)]">Original practical:</div>
        <div className="text-xs leading-snug mb-1">{info.paleo}</div>
        <div className="text-[10px] text-[var(--pw-text-faint)]">Symbolic:</div>
        <div className="pictograph-meaning leading-snug">{info.meaning}</div>
        {info.notes && (
          <div className="text-[10px] text-[var(--pw-text-faint)] mt-1">{info.notes}</div>
        )}
      </button>
    );
  },
);