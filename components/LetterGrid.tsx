'use client';

import React from 'react';
import { ParsedWord } from '../lib/pictograph';
import { ScriptureHebrew } from './ScriptureHebrew';

interface LetterGridProps {
  word: ParsedWord | null;
  showEmojis: boolean;
  selectedLetter?: string | null;
}

export function LetterGrid({ word, showEmojis, selectedLetter }: LetterGridProps) {
  const letters = word?.letters ?? [];

  return (
    <div className="space-y-3">
      <div className="text-xs uppercase tracking-widest text-[var(--pw-text-muted)]">
        Detailed Letter Cards
      </div>

      {/* Current word focus (if selected) */}
      {word && letters.length > 0 && (
        <div className="panel p-4">
          <div className="flex items-baseline gap-3 mb-3">
            <ScriptureHebrew
              text={word.original}
              className="scripture-hebrew text-3xl text-[var(--pw-hebrew)] tracking-wider"
            />
            <div className="text-[var(--pw-text-soft)] text-sm">{letters.length} letters</div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {letters.map((l, idx) => {
              const isHighlighted = !!selectedLetter && l.normalized === selectedLetter;
              return (
              <div key={idx} className={`letter-card ${isHighlighted ? 'border-[var(--pw-accent-gold)] ring-2 ring-[var(--pw-accent-gold)]/30 bg-[var(--pw-letter-bg)]' : ''}`}>
                <div className="letter text-[var(--pw-hebrew)] mb-1">{l.normalized}</div>
                <div className="text-[var(--pw-accent-gold)] font-medium text-sm mb-0.5">
                  {l.info.name}
                </div>
                <div className="text-xs text-[var(--pw-emoji)] mb-1">
                  {showEmojis ? l.info.emoji : ''}
                </div>
                <div className="text-[10px] text-[var(--pw-text-faint)]">Original practical:</div>
                <div className="text-xs leading-snug mb-1">{l.info.paleo}</div>
                <div className="text-[10px] text-[var(--pw-text-faint)]">Symbolic:</div>
                <div className="pictograph-meaning leading-snug">{l.info.meaning}</div>
                {l.info.notes && (
                  <div className="text-[10px] text-[var(--pw-text-faint)] mt-1">{l.info.notes}</div>
                )}
              </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
