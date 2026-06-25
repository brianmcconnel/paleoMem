'use client';

import React, { useMemo, useState } from 'react';
import { HELP_EXAMPLE_WORD } from '../data/help-example';
import { getBlueLetterBibleUrl, parseWord } from '../lib/pictograph';
import { getStrongs, getStrongsDisplay } from '../lib/strongs';
import { HebrewGraphemeText } from './HebrewGraphemeText';

export function HelpInterlinearExample() {
  const [wordSelected, setWordSelected] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const parsed = useMemo(() => parseWord(HELP_EXAMPLE_WORD.hebrew), []);
  const strongsDisplay = getStrongsDisplay(HELP_EXAMPLE_WORD.strongs, HELP_EXAMPLE_WORD.hebrew);
  const pronunciation = strongsDisplay.pronunciation || HELP_EXAMPLE_WORD.transliteration;

  const selectWord = () => {
    setWordSelected(true);
    setSelectedLetter(null);
  };

  const selectLetter = (consonant: string) => {
    setWordSelected(true);
    setSelectedLetter((current) => (current === consonant ? null : consonant));
  };

  return (
    <div className="rounded-lg border border-[var(--pw-border)] bg-[var(--pw-bg-elevated)]/60 p-3 space-y-3">
      <div>
        <div className="text-xs font-semibold uppercase tracking-widest text-[var(--pw-accent-gold)] mb-1">
          Try it — one word
        </div>
        <p className="text-xs text-[var(--pw-text-muted)] leading-relaxed">
          Same layout as the reader: English on top, Hebrew in the box below, then interlinear
          cards. Click a letter in the Hebrew — the matching pictograph card lights up underneath.
        </p>
      </div>

      {/* English — mirrors VerseDisplay */}
      <div className="card p-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="scripture-english text-sm leading-snug text-[var(--pw-english)] min-w-0 flex-1">
            <span
              role="button"
              tabIndex={0}
              onClick={selectWord}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  selectWord();
                }
              }}
              className={
                wordSelected && !selectedLetter
                  ? 'kjv-word-selected cursor-pointer'
                  : 'cursor-pointer hover:bg-[var(--pw-accent-gold)]/15 rounded-sm'
              }
              title={`Highlight Hebrew: ${HELP_EXAMPLE_WORD.hebrew}`}
            >
              {HELP_EXAMPLE_WORD.english}
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-[var(--pw-text-muted)] shrink-0 pt-0.5">
            KJV
          </span>
        </div>
      </div>

      {/* Hebrew reader box */}
      <div className="card p-2.5">
        <div
          className="scripture-hebrew text-[var(--pw-hebrew)] text-xl leading-relaxed select-none"
          dir="rtl"
          title="Click a letter to highlight its pictograph card below"
        >
          <HebrewGraphemeText
            text={HELP_EXAMPLE_WORD.hebrew}
            selectedLetter={selectedLetter}
            onConsonantClick={selectLetter}
          />
        </div>
      </div>

      <p className="text-[10px] text-[var(--pw-text-faint)] leading-relaxed">
        {selectedLetter ? (
          <>
            Letter <span className="text-[var(--pw-accent-gold)] font-medium">{selectedLetter}</span>{' '}
            is highlighted above and in the matching card below.
          </>
        ) : (
          <>Select a letter in the Hebrew box — it will highlight in the pictograph cards below.</>
        )}
      </p>

      <div className="flex flex-nowrap items-stretch gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          type="button"
          onClick={selectWord}
          className={`group shrink-0 text-left rounded-xl border p-2.5 min-w-[140px] max-w-[200px] transition-all card ${
            wordSelected
              ? 'border-[var(--pw-accent-gold)] ring-2 ring-[var(--pw-accent-gold)]/30 shadow-md'
              : 'border-[var(--pw-border)] hover:border-[var(--pw-accent-gold)]/60'
          }`}
          aria-pressed={wordSelected}
        >
          <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1 mb-1">
            <div
              className="scripture-hebrew text-2xl text-[var(--pw-hebrew)] leading-none"
              dir="rtl"
            >
              <HebrewGraphemeText
                text={HELP_EXAMPLE_WORD.hebrew}
                selectedLetter={selectedLetter}
                interactive={!!selectedLetter}
                highlightClassName="letter-in-passage bg-[var(--pw-accent-gold)] text-[var(--pw-on-gold)] px-0.5 rounded-sm"
                onConsonantClick={selectLetter}
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
              className={`font-mono text-[10px] px-1.5 py-px rounded border cursor-pointer hover:underline shrink-0 ${
                wordSelected && selectedLetter
                  ? 'bg-[var(--pw-accent-gold)] text-[var(--pw-on-gold)] border-[var(--pw-accent-gold)] font-semibold'
                  : 'bg-[var(--pw-bg-elevated)] text-[var(--pw-accent-gold)] border-[var(--pw-accent-gold)]/50 hover:bg-[var(--pw-accent-gold)]/10'
              }`}
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
          const isHighlighted = wordSelected && selectedLetter === letter.normalized;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => selectLetter(letter.normalized)}
              className={`letter-card shrink-0 w-[118px] text-left cursor-pointer ${
                isHighlighted
                  ? 'border-[var(--pw-accent-gold)] ring-2 ring-[var(--pw-accent-gold)]/30 bg-[var(--pw-letter-bg)]'
                  : ''
              }`}
            >
              <div className="letter text-[var(--pw-hebrew)] mb-1 text-center">{letter.normalized}</div>
              <div className="text-[var(--pw-accent-gold)] font-medium text-sm mb-0.5 text-center">
                {letter.info.name}
              </div>
              <div className="text-xs text-[var(--pw-emoji)] mb-1 text-center min-h-[1rem]">
                {letter.info.emoji}
              </div>
              <div className="text-[10px] text-[var(--pw-text-faint)]">Original practical:</div>
              <div className="text-xs leading-snug mb-1">{letter.info.paleo}</div>
              <div className="text-[10px] text-[var(--pw-text-faint)]">Symbolic:</div>
              <div className="pictograph-meaning leading-snug">{letter.info.meaning}</div>
            </button>
          );
        })}
      </div>

      <p className="text-[10px] text-[var(--pw-text-faint)] leading-relaxed">
        In a full verse, every Hebrew word gets this same row — Strong&apos;s card first, then one
        pictograph card per letter (read right to left).
      </p>
    </div>
  );
}