'use client';

import React from 'react';
import type { GreekInterlinearWord } from '../../data/greek-nt';
import { getBlueLetterBibleVerseUrl } from '../../lib/blueletterbible';
import { GreekWordInsightCard } from './GreekWordInsightCard';

interface GreekReaderPanelProps {
  children: React.ReactNode;
  selectedWord?: GreekInterlinearWord | null;
  book: string;
  chapter: number;
  verse: number;
}

export function GreekReaderPanel({
  children,
  selectedWord,
  book,
  chapter,
  verse,
}: GreekReaderPanelProps) {
  const blbUrl = getBlueLetterBibleVerseUrl(book, chapter, verse);

  return (
    <div className="card p-3">
      <div className="flex items-start justify-between gap-3">
        <div
          className="scripture-greek text-[var(--pw-greek)] text-xl leading-relaxed flex-1 min-w-0"
          dir="ltr"
          title="Greek — read left to right; click a word for its insight"
        >
          {children}
        </div>
        <a
          href={blbUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] uppercase tracking-widest text-[var(--pw-accent)] hover:underline shrink-0 pt-0.5"
          title="SBL Greek New Testament"
        >
          SBLGNT
        </a>
      </div>

      {selectedWord && (
        <div className="mt-2">
          <GreekWordInsightCard word={selectedWord} compact />
        </div>
      )}
    </div>
  );
}