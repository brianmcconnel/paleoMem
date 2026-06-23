'use client';

import React from 'react';
import { InterlinearWord } from '../data/verses';
import { stripPoints, getBlueLetterBibleUrl } from '../lib/pictograph';
import { getStrongs } from '../lib/strongs';

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
  // Render Hebrew text with graphical letter highlighting for the selected letter
  const renderHebrewWithHighlight = (hebrew: string, isActiveWord: boolean) => {
    if (!isActiveWord || !selectedLetter) {
      return <span dir="rtl">{hebrew}</span>;
    }

    const chars = Array.from(hebrew);
    return (
      <span dir="rtl">
        {chars.map((ch, idx) => {
          const base = stripPoints(ch);
          const isMatch = base === selectedLetter || stripPoints(ch) === selectedLetter;
          return (
            <span
              key={idx}
              className={
                isMatch
                  ? 'letter-in-passage bg-[var(--pw-accent-gold)] text-[#0b1118] px-0.5 rounded-sm'
                  : 'cursor-pointer hover:bg-[var(--pw-accent-gold)]/30 rounded-sm'
              }
              title={base ? `Select letter ${base}` : ''}
              onClick={e => {
                e.stopPropagation();
                if (onLetterClick && base) onLetterClick(base);
              }}
            >
              {ch}
            </span>
          );
        })}
      </span>
    );
  };

  if (!words || words.length === 0) {
    return (
      <div className="space-y-3">
        <div className="text-sm font-medium tracking-widest uppercase text-[var(--pw-text-muted)]">
          Interlinear Hebrew + Strong’s
        </div>
        <div className="bg-[var(--pw-bg-surface)] border border-[var(--pw-border)] p-4 rounded">
          <div className="scripture-hebrew text-xl text-[var(--pw-hebrew)]" dir="rtl">
            { /* Hebrew would come from OSHB open source */ }
            Hebrew text for this verse loaded from open source (see data fetch).
          </div>
          <div className="text-xs text-[var(--pw-text-muted)] mt-2">
            Full Hebrew + Strong’s interlinear for the entire Old Testament is available from the Open Scriptures Hebrew Bible (OSHB) open source project.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium tracking-widest uppercase text-[var(--pw-text-muted)]">
            Interlinear Hebrew + Strong’s
          </div>
          <div className="text-[10px] text-[var(--pw-text-faint)]">
            Strong’s references shown in Hebrew reading order (RTL) — data from OSHB
          </div>
        </div>
        <div className="text-xs px-2 py-1 rounded bg-[var(--pw-bg-elevated)] border border-[var(--pw-border)]">
          Strong’s RTL (matches Hebrew)
        </div>
      </div>

      {/* Word-by-word interlinear blocks - ordered right-to-left to match Hebrew text flow */}
      <div className="flex flex-wrap gap-3" dir="rtl">
        {words.map(word => {
          const isSelected = selectedId === word.id;
          return (
            <button
              key={word.id}
              onClick={() => onSelect(word)}
              className={`group text-left rounded-xl border p-3 min-w-[130px] transition-all card
                ${
                  isSelected
                    ? 'border-[var(--pw-accent-gold)] ring-2 ring-[var(--pw-accent-gold)]/30 shadow-md'
                    : 'border-[var(--pw-border)] hover:border-[var(--pw-accent-gold)]/60 hover:shadow-sm'
                }`}
              aria-pressed={isSelected}
            >
              {/* Hebrew word - properly RTL, with letter highlight when selected */}
              <div className="scripture-hebrew text-3xl mb-1.5 text-[var(--pw-hebrew)] leading-none">
                {renderHebrewWithHighlight(word.hebrew, isSelected)}
              </div>

              {/* LTR content for Strong's + gloss (English-friendly) */}
              <div dir="ltr" className="text-left">
                {/* Strong's number - graphical badge (highlighted when letter selected in this word) */}
                <div className="inline-flex items-center gap-1 mb-1.5">
                  <span
                    role="link"
                    tabIndex={0}
                    onClick={e => {
                      e.stopPropagation();
                      window.open(
                        getBlueLetterBibleUrl(word.strongs),
                        '_blank',
                        'noopener,noreferrer'
                      );
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        e.preventDefault();
                        window.open(
                          getBlueLetterBibleUrl(word.strongs),
                          '_blank',
                          'noopener,noreferrer'
                        );
                      }
                    }}
                    className={`font-mono text-xs px-1.5 py-px rounded border transition-all cursor-pointer hover:underline ${
                      isSelected && selectedLetter
                        ? 'bg-[var(--pw-accent-gold)] text-[#0b1118] border-[var(--pw-accent-gold)] font-semibold'
                        : 'bg-[var(--pw-bg-elevated)] text-[var(--pw-accent-gold)] border-[var(--pw-accent-gold)]/50 hover:bg-[var(--pw-accent-gold)]/10'
                    }`}
                    title={(() => {
                    const def = getStrongs(word.strongs);
                    const desc = def?.strongs_def || def?.kjv_def || '';
                    return `View ${word.strongs} on Blue Letter Bible${desc ? ' — ' + desc : ''}`;
                  })()}
                  >
                    {word.strongs}
                  </span>
                  {word.transliteration && (
                    <span className="text-[10px] text-[var(--pw-text-muted)] font-mono">
                      {word.transliteration}
                    </span>
                  )}
                </div>

                {/* KJV gloss / mapping */}
                <div className="text-sm text-[var(--pw-english)] leading-tight">
                  {word.gloss || word.strongs || '—'}
                </div>

                {/* Visual connector hint */}
                <div className="mt-2 text-[9px] text-[var(--pw-text-faint)] flex items-center gap-1 opacity-70 group-hover:opacity-100">
                  <span>→</span> pictographs
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="text-[10px] text-[var(--pw-text-faint)]">
        Strong’s references are ordered to match the Hebrew text flow (right-to-left). Click a
        Strong’s number to open it on Blue Letter Bible.
      </div>
    </div>
  );
}
