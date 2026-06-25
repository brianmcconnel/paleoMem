'use client';

import React, { useMemo, useState } from 'react';
import { InterlinearWord } from '../data/verses';
import { HebrewRtlNote } from './HebrewRtlHint';
import { ScriptureHebrew } from './ScriptureHebrew';
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
            <ScriptureHebrew
              text={seg.hebrew}
              className="scripture-hebrew text-[var(--pw-hebrew)] mr-1.5"
            />
            <span className="text-[var(--pw-text-muted)]">{part}</span>
          </button>
        );
      })}
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function VerseMeanings({ words, selectedWordId, onSelect }: VerseMeaningsProps) {
  const [expanded, setExpanded] = useState(false);
  const synthesis = useMemo(() => synthesizeVerseMeaning(words), [words]);

  if (!words.length) return null;

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
        aria-controls="verse-meanings-panel"
        className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-[var(--pw-bg-elevated)]/40 transition-colors"
      >
        <ChevronIcon open={expanded} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--pw-accent-gold)]">
              Advanced tooling
            </span>
            <span className="text-sm font-medium text-[var(--pw-text)]">
              Pictographic Verse Meaning
            </span>
          </div>
          <p className="text-xs text-[var(--pw-text-muted)] mt-1 leading-snug">
            Optional whole-verse synthesis — symbolic, practical, and emoji strings. Can be
            confusing; expand when you want the big-picture pictograph read.
          </p>
        </div>
      </button>

      {expanded && (
        <div id="verse-meanings-panel" className="border-t border-[var(--pw-border)] px-4 pb-4 pt-3 space-y-4">
          <HebrewRtlNote />
          <div className="rounded-lg border border-[var(--pw-border)] bg-[var(--pw-bg-surface)] p-4 space-y-5">
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
      )}
    </div>
  );
}