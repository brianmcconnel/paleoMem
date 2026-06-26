'use client';

import React from 'react';
import type { GreekInterlinearWord } from '../../data/greek-nt';
import { GreekWordInsightCard } from './GreekWordInsightCard';

interface GreekReaderPanelProps {
  children: React.ReactNode;
  selectedWord?: GreekInterlinearWord | null;
}

export function GreekReaderPanel({ children, selectedWord }: GreekReaderPanelProps) {
  return (
    <div className="card p-3">
      <div className="flex items-start justify-between gap-3">
        <div
          className="scripture-greek text-[var(--pw-greek)] text-xl leading-relaxed flex-1 min-w-0"
          dir="ltr"
          title="Koine Greek — read left to right; click a word for its insight"
        >
          {children}
        </div>
      </div>

      {selectedWord && (
        <div className="mt-2">
          <GreekWordInsightCard word={selectedWord} compact />
        </div>
      )}

      <div className="mt-2 rounded-lg border border-[var(--pw-accent)]/40 bg-[var(--pw-accent)]/10 px-3 py-2 text-[10px] leading-snug text-[var(--pw-text-soft)]">
        <div className="flex items-start gap-2">
          <span className="shrink-0 uppercase tracking-widest px-1.5 py-0.5 rounded border border-[var(--pw-accent)]/50 text-[var(--pw-accent)] font-medium">
            Koine · 1st c. AD
          </span>
          <p className="text-[var(--pw-text-muted)]">
            New Testament Greek (κοινή) — the common Hellenistic dialect of the apostolic era (c.
            AD 45–100). Text from SBLGNT where loaded.
          </p>
        </div>
      </div>
    </div>
  );
}