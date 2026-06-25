'use client';

import React, { useMemo, useState } from 'react';
import { HELP_EXAMPLE_WORD } from '../data/help-example';
import { getBlueLetterBibleUrl, parseWord } from '../lib/pictograph';
import { getStrongs, getStrongsDisplay } from '../lib/strongs';
import { HebrewGraphemeText } from './HebrewGraphemeText';
import { LetterCard } from './LetterCard';
import { ScriptureHebrew } from './ScriptureHebrew';

export function HelpInterlinearExample() {
  const [selected, setSelected] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const parsed = useMemo(() => parseWord(HELP_EXAMPLE_WORD.hebrew), []);
  const strongsDisplay = getStrongsDisplay(HELP_EXAMPLE_WORD.strongs, HELP_EXAMPLE_WORD.hebrew);
  const pronunciation = strongsDisplay.pronunciation || HELP_EXAMPLE_WORD.transliteration;

  return (
    <div className="rounded-lg border border-[var(--pw-border)] bg-[var(--pw-bg-elevated)]/60 p-3 space-y-3">
      <div>
        <div className="text-xs font-semibold uppercase tracking-widest text-[var(--pw-accent-gold)] mb-1">
          Try it — one word
        </div>
        <p className="text-xs text-[var(--pw-text-muted)] leading-relaxed">
          Example: <ScriptureHebrew text={HELP_EXAMPLE_WORD.hebrew} className="scripture-hebrew" /> (
          {HELP_EXAMPLE_WORD.gloss}) — two letters, right to left. The Strong&apos;s card gives the
          dictionary sense; letter cards show each pictograph. Tap a letter card to highlight it.
        </p>
      </div>

      <div className="flex flex-nowrap items-stretch gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          type="button"
          onClick={() => {
            setSelected(true);
            setSelectedLetter(null);
          }}
          className={`group shrink-0 text-left rounded-xl border p-2.5 min-w-[140px] max-w-[200px] transition-all card ${
            selected
              ? 'border-[var(--pw-accent-gold)] ring-2 ring-[var(--pw-accent-gold)]/30 shadow-md'
              : 'border-[var(--pw-border)] hover:border-[var(--pw-accent-gold)]/60'
          }`}
          aria-pressed={selected}
        >
          <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1 mb-1">
            <div
              className="scripture-hebrew text-2xl text-[var(--pw-hebrew)] leading-none"
              dir="rtl"
            >
              <HebrewGraphemeText
                text={HELP_EXAMPLE_WORD.hebrew}
                selectedLetter={selectedLetter}
                interactive={selected && !!selectedLetter}
                highlightClassName="letter-in-passage bg-[var(--pw-accent-gold)] text-[var(--pw-on-gold)] px-0.5 rounded-sm"
                onConsonantClick={(consonant) => setSelectedLetter(consonant)}
              />
            </div>
            <span
              role="link"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  getBlueLetterBibleUrl(HELP_EXAMPLE_WORD.strongs),
                  '_blank',
                  'noopener,noreferrer',
                );
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  e.preventDefault();
                  window.open(
                    getBlueLetterBibleUrl(HELP_EXAMPLE_WORD.strongs),
                    '_blank',
                    'noopener,noreferrer',
                  );
                }
              }}
              className="font-mono text-[10px] px-1.5 py-px rounded border cursor-pointer hover:underline bg-[var(--pw-bg-elevated)] text-[var(--pw-accent-gold)] border-[var(--pw-accent-gold)]/50 hover:bg-[var(--pw-accent-gold)]/10 shrink-0"
              title={(() => {
                const def = getStrongs(HELP_EXAMPLE_WORD.strongs);
                const desc = def?.strongs_def || def?.kjv_def || '';
                return `View ${HELP_EXAMPLE_WORD.strongs} on Blue Letter Bible${desc ? ' — ' + desc : ''}`;
              })()}
            >
              {HELP_EXAMPLE_WORD.strongs}
            </span>
          </div>

          <div dir="ltr" className="text-left">
            {pronunciation && (
              <div className="text-xs font-medium text-[var(--pw-english)] leading-tight font-mono">
                {pronunciation}
              </div>
            )}
            {strongsDisplay.definition && (
              <div className="text-[10px] leading-snug text-[var(--pw-text-muted)] mt-1.5 border-t border-[var(--pw-border)] pt-1.5 line-clamp-4">
                {strongsDisplay.definition}
              </div>
            )}
          </div>
        </button>

        {parsed.letters.map((letter, idx) => {
          const isHighlighted = selected && selectedLetter === letter.normalized;
          return (
            <LetterCard
              key={idx}
              letter={letter}
              showEmojis
              isHighlighted={isHighlighted}
              onClick={() => {
                setSelected(true);
                setSelectedLetter(
                  selectedLetter === letter.normalized ? null : letter.normalized,
                );
              }}
            />
          );
        })}
      </div>

      <p className="text-[10px] text-[var(--pw-text-faint)] leading-relaxed">
        In a real verse row, every Hebrew word gets this same layout — Strong&apos;s first, then one
        pictograph card per letter (read the letters right to left).
      </p>
    </div>
  );
}