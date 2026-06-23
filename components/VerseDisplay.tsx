'use client';

import React, { useMemo } from 'react';
import { ScriptureVerse, InterlinearWord } from '../data/verses';
import { alignKjvToHebrewWords } from '../lib/kjv-align';

interface VerseDisplayProps {
  verse?: ScriptureVerse;
  selectedRef?: string;
  selectedWordId?: number | null;
  onWordSelect?: (word: InterlinearWord) => void;
}

export function VerseDisplay({
  verse,
  selectedRef,
  selectedWordId,
  onWordSelect,
}: VerseDisplayProps) {
  const segments = useMemo(
    () => (verse ? alignKjvToHebrewWords(verse.kjv, verse.words) : []),
    [verse],
  );

  const wordById = useMemo(() => {
    const map = new Map<number, InterlinearWord>();
    verse?.words.forEach((w) => map.set(w.id, w));
    return map;
  }, [verse]);

  if (!verse) {
    return (
      <div className="card p-6">
        <div className="uppercase tracking-[3px] text-xs mb-1.5 text-[var(--pw-text-muted)]">
          King James Version (KJV)
        </div>
        <div className="text-[var(--pw-text-muted)] text-lg">
          No KJV text loaded for{' '}
          <span className="font-mono text-[var(--pw-accent-gold)]">{selectedRef}</span>.
        </div>
        <div className="mt-4 text-xs text-[var(--pw-text-faint)]">
          This reference is navigable. Detailed data is only available for sampled verses.
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="uppercase tracking-[3px] text-xs mb-1.5 text-[var(--pw-text-muted)]">
        King James Version (KJV)
      </div>

      <div className="scripture-english text-[1.25rem] leading-snug text-[var(--pw-english)]">
        {segments.map((seg, i) => {
          if (seg.wordId == null) {
            return <span key={i}>{seg.text}</span>;
          }

          const word = wordById.get(seg.wordId);
          const isSelected = selectedWordId === seg.wordId;

          return (
            <span
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => word && onWordSelect?.(word)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && word) {
                  e.preventDefault();
                  onWordSelect?.(word);
                }
              }}
              className={
                isSelected
                  ? 'kjv-word-selected cursor-pointer'
                  : 'cursor-pointer hover:bg-[var(--pw-accent-gold)]/15 rounded-sm'
              }
              title={word ? `Highlight Hebrew: ${word.hebrew}` : undefined}
            >
              {seg.text}
            </span>
          );
        })}
      </div>
    </div>
  );
}