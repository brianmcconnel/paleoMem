'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { InterlinearWord } from '../data/verses';
import { getBlueLetterBibleUrl, parseWord } from '../lib/pictograph';
import { HebrewGraphemeText } from './HebrewGraphemeText';
import {
  getStrongs,
  getStrongsDisplay,
  isMorphologicalStrongsCode,
} from '../lib/strongs';
import { HebrewRtlNote } from './HebrewRtlHint';
import { LetterCard } from './LetterCard';

interface InterlinearProps {
  words: InterlinearWord[];
  selectedId: number | null;
  selectedLetter: string | null;
  onSelect: (word: InterlinearWord) => void;
  onLetterClick?: (letter: string) => void;
}

export function Interlinear({
  words,
  selectedId,
  selectedLetter,
  onSelect,
  onLetterClick,
}: InterlinearProps) {
  const [showEmojis, setShowEmojis] = useState(true);
  const selectedLetterRef = useRef<HTMLButtonElement>(null);

  const parsedWords = useMemo(
    () => words.map((word) => ({ word, parsed: parseWord(word.hebrew) })),
    [words],
  );

  const renderHebrewWithHighlight = (
    word: InterlinearWord,
    hebrew: string,
    isActiveWord: boolean,
  ) => (
    <HebrewGraphemeText
      text={hebrew}
      selectedLetter={selectedLetter}
      interactive={isActiveWord && !!selectedLetter}
      highlightClassName="letter-in-passage bg-[var(--pw-accent-gold)] text-[var(--pw-on-gold)] px-0.5 rounded-sm"
      consonantClassName="cursor-pointer hover:bg-[var(--pw-accent-gold)]/30 rounded-sm"
      onConsonantClick={(consonant) => {
        onSelect(word);
        onLetterClick?.(consonant);
      }}
    />
  );

  useEffect(() => {
    if (!selectedId || !selectedLetter) return;

    const letterEl = selectedLetterRef.current;
    const readerEl = document.getElementById('reader');
    if (!letterEl || !readerEl) return;

    const scrollToLetter = () => {
      letterEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

      const readerBottom = readerEl.getBoundingClientRect().bottom;
      const letterTop = letterEl.getBoundingClientRect().top;
      const gap = 12;
      const delta = letterTop - readerBottom - gap;

      if (Math.abs(delta) > 4) {
        window.scrollBy({ top: delta, behavior: 'smooth' });
      }
    };

    requestAnimationFrame(scrollToLetter);
  }, [selectedId, selectedLetter]);

  if (!words || words.length === 0) {
    return (
      <div className="space-y-3">
        <div className="text-sm font-medium tracking-widest uppercase text-[var(--pw-text-muted)]">
          Interlinear Hebrew + Strong’s + Pictographs
        </div>
        <div className="bg-[var(--pw-bg-surface)] border border-[var(--pw-border)] p-4 rounded">
          <div className="scripture-hebrew text-xl text-[var(--pw-hebrew)]" dir="rtl">
            Hebrew text for this verse loaded from open source (see data fetch).
          </div>
          <div className="text-xs text-[var(--pw-text-muted)] mt-2">
            Full Hebrew + Strong’s interlinear for the entire Old Testament is available from the
            Open Scriptures Hebrew Bible (OSHB) open source project.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-sm font-medium tracking-widest uppercase text-[var(--pw-text-muted)]">
            Interlinear Hebrew + Strong’s + Pictographs
          </div>
          <HebrewRtlNote />
          <div className="text-[10px] text-[var(--pw-text-faint)] mt-1">
            Each row: Strong’s card first, then letter pictographs for that word.
          </div>
        </div>
        <label className="toggle text-sm shrink-0">
          <input
            type="checkbox"
            checked={showEmojis}
            onChange={(e) => setShowEmojis(e.target.checked)}
          />
          <span>Show emojis</span>
        </label>
      </div>

      <div className="space-y-4">
        {parsedWords.map(({ word, parsed }) => {
          const isSelected = selectedId === word.id;
          const strongsDisplay = getStrongsDisplay(word.strongs, word.hebrew);
          const pronunciation =
            strongsDisplay.pronunciation || word.transliteration || '';
          const strongsDef = strongsDisplay.definition;
          const strongsLinkable = !isMorphologicalStrongsCode(word.strongs);

          return (
            <div
              key={word.id}
              className={`flex flex-nowrap items-stretch gap-3 overflow-x-auto pb-1 rounded-xl p-2 -mx-2 ${
                isSelected ? 'bg-[var(--pw-bg-panel)]/40' : ''
              }`}
            >
              {/* Strong's word card — first in row */}
              <button
                type="button"
                onClick={() => onSelect(word)}
                className={`group shrink-0 text-left rounded-xl border p-3 min-w-[160px] max-w-[240px] transition-all card
                  ${
                    isSelected
                      ? 'border-[var(--pw-accent-gold)] ring-2 ring-[var(--pw-accent-gold)]/30 shadow-md'
                      : 'border-[var(--pw-border)] hover:border-[var(--pw-accent-gold)]/60 hover:shadow-sm'
                  }`}
                aria-pressed={isSelected}
              >
                <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1 mb-1.5">
                  <div
                    className="scripture-hebrew text-3xl text-[var(--pw-hebrew)] leading-none"
                    dir="rtl"
                  >
                    {renderHebrewWithHighlight(word, word.hebrew, isSelected)}
                  </div>
                  <span
                    role={strongsLinkable ? 'link' : undefined}
                    tabIndex={strongsLinkable ? 0 : undefined}
                    onClick={
                      strongsLinkable
                        ? (e) => {
                            e.stopPropagation();
                            window.open(
                              getBlueLetterBibleUrl(word.strongs),
                              '_blank',
                              'noopener,noreferrer',
                            );
                          }
                        : undefined
                    }
                    onKeyDown={
                      strongsLinkable
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.stopPropagation();
                              e.preventDefault();
                              window.open(
                                getBlueLetterBibleUrl(word.strongs),
                                '_blank',
                                'noopener,noreferrer',
                              );
                            }
                          }
                        : undefined
                    }
                    className={`font-mono text-xs px-1.5 py-px rounded border transition-all shrink-0 ${
                      strongsLinkable ? 'cursor-pointer hover:underline' : 'cursor-default'
                    } ${
                      isSelected && selectedLetter
                        ? 'bg-[var(--pw-accent-gold)] text-[var(--pw-on-gold)] border-[var(--pw-accent-gold)] font-semibold'
                        : 'bg-[var(--pw-bg-elevated)] text-[var(--pw-accent-gold)] border-[var(--pw-accent-gold)]/50 hover:bg-[var(--pw-accent-gold)]/10'
                    }`}
                    title={
                      strongsLinkable
                        ? (() => {
                            const def = getStrongs(word.strongs);
                            const desc = def?.strongs_def || def?.kjv_def || '';
                            return `View ${word.strongs} on Blue Letter Bible${desc ? ' — ' + desc : ''}`;
                          })()
                        : 'OSHB morpheme tag — not a numbered Strong\'s entry'
                    }
                  >
                    {word.strongs}
                  </span>
                </div>

                <div dir="ltr" className="text-left">
                  {pronunciation && (
                    <div className="text-sm font-medium text-[var(--pw-english)] leading-tight font-mono">
                      {pronunciation}
                    </div>
                  )}

                  {strongsDef && (
                    <div
                      className={`text-xs leading-snug ${
                        strongsDisplay.isFallback
                          ? 'text-[var(--pw-text-faint)] italic'
                          : 'text-[var(--pw-text-muted)]'
                      } ${pronunciation ? 'mt-2 border-t border-[var(--pw-border)] pt-2' : ''}`}
                    >
                      {strongsDef}
                    </div>
                  )}
                </div>
              </button>

              {/* Letter pictograph cards */}
              {parsed.letters.map((letter, idx) => {
                const isHighlighted = isSelected && selectedLetter === letter.normalized;
                return (
                  <LetterCard
                    key={`${word.id}-${idx}`}
                    ref={isHighlighted ? selectedLetterRef : undefined}
                    letter={letter}
                    showEmojis={showEmojis}
                    isHighlighted={isHighlighted}
                    onClick={() => {
                      onSelect(word);
                      onLetterClick?.(letter.normalized);
                    }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="text-[10px] text-[var(--pw-text-faint)]">
        Words follow Hebrew verse order (right to left). Each row scrolls horizontally if needed.
        Click a Strong’s number to open it on Blue Letter Bible.
      </div>
    </div>
  );
}