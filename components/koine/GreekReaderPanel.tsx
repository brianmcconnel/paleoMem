'use client';

import React from 'react';
import { MU_WATERS_INSIGHT } from '../../lib/greek-insights';

interface GreekReaderPanelProps {
  children: React.ReactNode;
}

export function GreekReaderPanel({ children }: GreekReaderPanelProps) {
  return (
    <div className="card p-3">
      <div className="flex items-start justify-between gap-3">
        <div
          className="scripture-greek text-[var(--pw-greek)] text-xl leading-relaxed select-none flex-1 min-w-0"
          dir="ltr"
          title="Koine Greek — read left to right (SBLGNT)"
        >
          {children}
        </div>
      </div>

      <div className="mt-2 rounded-lg border border-[var(--pw-accent)]/40 bg-[var(--pw-accent)]/10 px-3 py-2 text-[10px] leading-snug text-[var(--pw-text-soft)]">
        <div className="flex items-start gap-2">
          <span className="shrink-0 uppercase tracking-widest px-1.5 py-0.5 rounded border border-[var(--pw-accent)]/50 text-[var(--pw-accent)] font-medium">
            Koine · 1st c. AD
          </span>
          <p className="text-[var(--pw-text-muted)]">
            New Testament Greek (κοινή) — the common Hellenistic dialect of the apostolic era (c.
            AD 45–100). Text from SBLGNT.
          </p>
        </div>
      </div>

      <div className="mt-2 rounded-lg border border-[var(--pw-border)] bg-[var(--pw-bg-elevated)]/50 px-3 py-2 text-[10px] leading-snug">
        <div className="flex items-start gap-2">
          <span className="shrink-0 font-semibold scripture-greek text-[var(--pw-greek)] text-sm">
            {MU_WATERS_INSIGHT.letter}
          </span>
          <div className="space-y-1 text-[var(--pw-text-muted)]">
            <p>
              <span className="font-medium text-[var(--pw-text-soft)]">Mu</span> parallels Hebrew{' '}
              <span className="scripture-hebrew text-[var(--pw-hebrew)]">מ</span> (Mem / mayim,
              waters). NT authors wrote in Greek — study{' '}
              <span className="scripture-greek text-[var(--pw-greek)]">ὕδωρ</span> (water) themes,
              not pictograph letter cards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}