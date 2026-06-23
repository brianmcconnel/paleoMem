'use client';

import React from 'react';
import { ScriptureVerse } from '../data/verses';

interface VerseDisplayProps {
  verse?: ScriptureVerse;
  selectedRef?: string;
}

export function VerseDisplay({ verse, selectedRef }: VerseDisplayProps) {
  if (!verse) {
    return (
      <div className="card p-6">
        <div className="uppercase tracking-[3px] text-xs mb-1.5 text-[var(--pw-text-muted)]">
          King James Version (KJV)
        </div>
        <div className="text-[var(--pw-text-muted)] text-lg">
          No KJV text loaded for <span className="font-mono text-[var(--pw-accent-gold)]">{selectedRef}</span>.
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

      {/* KJV — primary English text, large and reverent */}
      <div className="scripture-english text-[1.25rem] leading-snug text-[var(--pw-english)]">
        {verse.kjv}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="text-[var(--pw-text-faint)]">Public domain • {verse.ref}</div>
        <div className="text-[var(--pw-text-muted)]">KJV first, then Hebrew interlinear</div>
      </div>
    </div>
  );
}
