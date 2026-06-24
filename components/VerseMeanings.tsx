'use client';

import React, { useMemo } from 'react';
import { InterlinearWord } from '../data/verses';
import { HebrewRtlNote } from './HebrewRtlHint';
import { synthesizeVerseMeaning } from '../lib/word-meaning';

interface VerseMeaningsProps {
  words: InterlinearWord[];
  selectedWordId: number | null;
  onSelect: (word: InterlinearWord) => void;
}

function WordLinks({
  segments,
  words,
  selectedWordId,
  onSelect,
  field,
}: {
  segments: ReturnType<typeof synthesizeVerseMeaning>['words'];
  words: InterlinearWord[];
  selectedWordId: number | null;
  onSelect: (word: InterlinearWord) => void;
  field: 'symbolicPart' | 'practicalPart' | 'emojiPart';
}) {
  const wordById = useMemo(() => {
    const map = new Map<number, InterlinearWord>();
    words.forEach((w) => map.set(w.id, w));
    return map;
  }, [words]);

  return (
    <div className="flex flex-wrap gap-1.5 pt-2">
      {segments.map((seg) => {
        const word = wordById.get(seg.wordId);
        const isSelected = selectedWordId === seg.wordId;
        const part = seg[field];

        if (!part || !word) return null;

        return (
          <button
            key={`${seg.wordId}-${field}`}
            type="button"
            onClick={() => onSelect(word)}
            className={`text-left rounded-lg border px-2 py-1 transition-all text-xs max-w-full ${
              isSelected
                ? 'border-[var(--pw-accent-gold)] bg-[var(--pw-accent-gold)]/10 ring-1 ring-[var(--pw-accent-gold)]/40'
                : 'border-[var(--pw-border)] hover:border-[var(--pw-accent-gold)]/50 bg-[var(--pw-bg-elevated)]'
            }`}
            title={`${seg.strongs} — ${part}`}
            aria-pressed={isSelected}
          >
            <span className="scripture-hebrew text-[var(--pw-hebrew)] mr-1.5" dir="rtl">
              {seg.hebrew}
            </span>
            <span className="text-[var(--pw-text-muted)]">{part}</span>
          </button>
        );
      })}
    </div>
  );
}

export function VerseMeanings({ words, selectedWordId, onSelect }: VerseMeaningsProps) {
  const synthesis = useMemo(() => synthesizeVerseMeaning(words), [words]);

  if (!words.length) return null;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-medium tracking-widest uppercase text-[var(--pw-text-muted)]">
          Pictographic Verse Meaning
        </div>
        <HebrewRtlNote />
        <div className="text-[10px] text-[var(--pw-text-faint)] mt-1">
          Whole-verse synthesis — symbolic, practical, and emoji strings follow Hebrew word order.
        </div>
      </div>

      <div className="card p-4 space-y-5">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-[var(--pw-text-faint)] mb-1">
            Symbolic meaning
          </div>
          <div className="text-sm leading-relaxed text-[var(--pw-meaning)]">
            {synthesis.symbolicMeaning || '—'}
          </div>
          <WordLinks
            segments={synthesis.words}
            words={words}
            selectedWordId={selectedWordId}
            onSelect={onSelect}
            field="symbolicPart"
          />
        </div>

        <div className="border-t border-[var(--pw-border)] pt-4">
          <div className="text-[10px] uppercase tracking-widest text-[var(--pw-text-faint)] mb-1">
            Original practical meaning
          </div>
          <div className="text-sm leading-relaxed text-[var(--pw-text-soft)]">
            {synthesis.practicalMeaning || '—'}
          </div>
          <WordLinks
            segments={synthesis.words}
            words={words}
            selectedWordId={selectedWordId}
            onSelect={onSelect}
            field="practicalPart"
          />
        </div>

        <div className="border-t border-[var(--pw-border)] pt-4">
          <div className="text-[10px] uppercase tracking-widest text-[var(--pw-text-faint)] mb-1">
            Emoji string
          </div>
          <div className="text-2xl tracking-wide text-[var(--pw-emoji)] leading-relaxed">
            {synthesis.emojiString || '—'}
          </div>
          <WordLinks
            segments={synthesis.words}
            words={words}
            selectedWordId={selectedWordId}
            onSelect={onSelect}
            field="emojiPart"
          />
        </div>
      </div>
    </div>
  );
}