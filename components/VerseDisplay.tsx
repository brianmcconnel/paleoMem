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
      <div className="card p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="text-[var(--pw-text-muted)] text-sm min-w-0">
            No text for{' '}
            <span className="font-mono text-[var(--pw-accent-gold)]">{selectedRef}</span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-[var(--pw-text-muted)] shrink-0">
            KJV
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="scripture-english text-[1.05rem] leading-snug text-[var(--pw-english)] min-w-0 flex-1">
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
        <span className="text-[10px] uppercase tracking-widest text-[var(--pw-text-muted)] shrink-0 pt-0.5">
          KJV
        </span>
      </div>
    </div>
  );
}