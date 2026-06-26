'use client';

import React, { useEffect, useRef } from 'react';
import type { GreekInterlinearWord } from '../../data/greek-nt';
import { getBlueLetterBibleUrl } from '../../lib/pictograph';
import { getStrongs, getStrongsDisplay } from '../../lib/strongs';
import { isJesusGreekWord } from '../../lib/red-letter';
import { GreekWordInsightCard } from './GreekWordInsightCard';

interface GreekInterlinearProps {
  words: GreekInterlinearWord[];
  selectedId: number | null;
  onSelect: (word: GreekInterlinearWord) => void;
}

export function GreekInterlinear({ words, selectedId, onSelect }: GreekInterlinearProps) {
  const selectedRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedId) return;

    const rowEl = selectedRowRef.current;
    const readerEl = document.getElementById('reader');
    if (!rowEl || !readerEl) return;

    const scrollToRow = () => {
      rowEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });

      const readerBottom = readerEl.getBoundingClientRect().bottom;
      const rowTop = rowEl.getBoundingClientRect().top;
      const gap = 12;
      const delta = rowTop - readerBottom - gap;

      if (Math.abs(delta) > 4) {
        window.scrollBy({ top: delta, behavior: 'smooth' });
      }
    };

    requestAnimationFrame(scrollToRow);
  }, [selectedId]);

  if (!words.length) return null;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-medium tracking-widest uppercase text-[var(--pw-text-muted)]">
          Interlinear Greek + Strong&apos;s + Word insights
        </div>
        <div className="text-[10px] text-[var(--pw-text-faint)] mt-1">
          Click a Greek word in the reader to see its insight above and here. Greek reads left to
          right.
        </div>
      </div>

      <div className="space-y-4">
        {words.map((word) => {
          const isSelected = selectedId === word.id;
          const isJesus = isJesusGreekWord(word);
          const strongsDisplay = getStrongsDisplay(word.strongs);
          const pronunciation =
            strongsDisplay.pronunciation || word.transliteration || '';

          return (
            <div
              key={word.id}
              ref={isSelected ? selectedRowRef : undefined}
              className={`flex flex-nowrap items-stretch gap-3 overflow-x-auto pb-1 rounded-xl p-2 -mx-2 ${
                isSelected ? 'bg-[var(--pw-bg-panel)]/40' : ''
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(word)}
                className={`group shrink-0 text-left rounded-xl border p-3 min-w-[160px] max-w-[240px] transition-all card ${
                  isSelected
                    ? 'border-[var(--pw-accent)] ring-2 ring-[var(--pw-accent)]/30 shadow-md'
                    : 'border-[var(--pw-border)] hover:border-[var(--pw-accent)]/60 hover:shadow-sm'
                }`}
                aria-pressed={isSelected}
              >
                <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1 mb-1.5">
                  <div
                    className={`scripture-greek text-3xl leading-none ${
                      isJesus ? 'text-[var(--pw-jesus)]' : 'text-[var(--pw-greek)]'
                    }`}
                  >
                    {word.greek}
                  </div>
                  <span
                    role="link"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(
                        getBlueLetterBibleUrl(word.strongs),
                        '_blank',
                        'noopener,noreferrer',
                      );
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        e.preventDefault();
                        window.open(
                          getBlueLetterBibleUrl(word.strongs),
                          '_blank',
                          'noopener,noreferrer',
                        );
                      }
                    }}
                    className={`font-mono text-xs px-1.5 py-px rounded border cursor-pointer hover:underline transition-all shrink-0 ${
                      isSelected
                        ? 'bg-[var(--pw-accent)] text-[var(--pw-bg-app)] border-[var(--pw-accent)] font-semibold'
                        : 'bg-[var(--pw-bg-elevated)] text-[var(--pw-accent)] border-[var(--pw-accent)]/50 hover:bg-[var(--pw-accent)]/10'
                    }`}
                    title={(() => {
                      const def = getStrongs(word.strongs);
                      const desc = def?.strongs_def || def?.kjv_def || '';
                      return `View ${word.strongs} on Blue Letter Bible${desc ? ' — ' + desc : ''}`;
                    })()}
                  >
                    {word.strongs}
                  </span>
                </div>

                {pronunciation && (
                  <div className="text-sm font-medium text-[var(--pw-english)] leading-tight font-mono">
                    {pronunciation}
                  </div>
                )}
                {word.gloss && (
                  <div className="text-xs text-[var(--pw-text-muted)] mt-1">{word.gloss}</div>
                )}
                {strongsDisplay.definition && !strongsDisplay.isFallback && (
                  <div className="text-xs text-[var(--pw-text-faint)] mt-2 border-t border-[var(--pw-border)] pt-2 leading-snug line-clamp-4">
                    {strongsDisplay.definition}
                  </div>
                )}
              </button>

              <div className="shrink-0 min-w-[200px] max-w-[320px]">
                <GreekWordInsightCard word={word} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[10px] text-[var(--pw-text-faint)]">
        Words follow Greek verse order (left to right). Click a Strong&apos;s number for Blue Letter
        Bible Greek lexicon.
      </div>
    </div>
  );
}