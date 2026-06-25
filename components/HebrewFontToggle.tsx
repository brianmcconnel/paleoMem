'use client';

import React from 'react';
import { useHebrewFont } from './HebrewFontContext';

export function HebrewFontToggle() {
  const { font, toggleFont } = useHebrewFont();
  const isPaleo = font === 'paleo';

  return (
    <button
      type="button"
      onClick={toggleFont}
      className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-colors scripture-hebrew text-lg leading-none ${
        isPaleo
          ? 'border-[var(--pw-accent-gold)] bg-[var(--pw-accent-gold)]/15 text-[var(--pw-accent-gold)]'
          : 'border-[var(--pw-border)] bg-[var(--pw-bg-surface)] text-[var(--pw-text-muted)] hover:text-[var(--pw-accent-gold)] hover:border-[var(--pw-accent-gold)]/50'
      }`}
      title={
        isPaleo
          ? 'Paleo-Hebrew font (Robo-PaleoHeb) — switch to modern Hebrew'
          : 'Modern Hebrew font (Noto) — switch to Paleo-Hebrew'
      }
      aria-label={
        isPaleo ? 'Switch to modern Hebrew font' : 'Switch to Paleo-Hebrew font'
      }
      aria-pressed={isPaleo}
    >
      א
    </button>
  );
}