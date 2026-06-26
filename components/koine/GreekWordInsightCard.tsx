'use client';

import React from 'react';
import type { GreekInterlinearWord } from '../../data/greek-nt';
import { getGreekWordInsight } from '../../lib/greek-insights';
import { isJesusGreekWord } from '../../lib/red-letter';
import { getBlueLetterBibleUrl } from '../../lib/pictograph';

interface GreekWordInsightCardProps {
  word: GreekInterlinearWord;
  compact?: boolean;
}

export function GreekWordInsightCard({ word, compact = false }: GreekWordInsightCardProps) {
  const insight = getGreekWordInsight(word);
  const isJesus = isJesusGreekWord(word);

  return (
    <div
      className={`rounded-lg border border-[var(--pw-accent-gold)]/50 bg-[var(--pw-bg-elevated)]/80 ${
        compact ? 'px-3 py-2.5 text-[10px]' : 'p-3'
      }`}
    >
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-1.5">
        <span
          className={`scripture-greek text-lg leading-none ${
            isJesus ? 'text-[var(--pw-jesus)]' : 'text-[var(--pw-greek)]'
          }`}
        >
          {word.greek}
        </span>
        <a
          href={getBlueLetterBibleUrl(word.strongs)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[10px] px-1.5 py-px rounded border border-[var(--pw-accent)]/50 text-[var(--pw-accent)] hover:underline"
        >
          {word.strongs}
        </a>
        {word.gloss && (
          <span className="text-[var(--pw-text-muted)] italic">— {word.gloss}</span>
        )}
      </div>
      <div
        className={`font-medium text-[var(--pw-text-soft)] leading-snug ${
          compact ? 'text-[11px]' : 'text-sm'
        }`}
      >
        {insight.title}
      </div>
      <p className={`text-[var(--pw-text-muted)] mt-1.5 leading-relaxed ${compact ? '' : 'text-xs'}`}>
        {insight.etymology}
      </p>
      {insight.symbolism && (
        <p
          className={`text-[var(--pw-meaning)] mt-1.5 leading-relaxed border-t border-[var(--pw-border)] pt-1.5 ${
            compact ? '' : 'text-xs'
          }`}
        >
          {insight.symbolism}
        </p>
      )}
      {insight.devotional && (
        <p className={`text-[var(--pw-text-faint)] mt-1.5 italic leading-relaxed ${compact ? '' : 'text-xs'}`}>
          {insight.devotional}
        </p>
      )}
    </div>
  );
}