'use client';

import React from 'react';
import type { NumberingStatus } from '../lib/kjv-numbering';

export function VerseNumberingWarning({ status }: { status: NumberingStatus }) {
  if (status.kind === 'aligned') return null;

  const badge =
    status.kind === 'kjv-only'
      ? { label: 'KJV only', tone: 'warning' as const }
      : status.kind === 'chapter-divergence'
        ? { label: 'Numbering', tone: 'warning' as const }
        : { label: 'Verse map', tone: 'accent' as const };

  const toneClasses =
    badge.tone === 'warning'
      ? {
          box: 'border-[var(--pw-warning)]/50 bg-[var(--pw-warning)]/10',
          badge: 'border-[var(--pw-warning)]/50 text-[var(--pw-warning)]',
        }
      : {
          box: 'border-[var(--pw-accent)]/40 bg-[var(--pw-accent)]/10',
          badge: 'border-[var(--pw-accent)]/50 text-[var(--pw-accent)]',
        };

  return (
    <div
      role="alert"
      className={`mt-2 rounded-lg border px-3 py-2.5 text-[10px] leading-snug text-[var(--pw-text-soft)] ${toneClasses.box}`}
    >
      <div className="flex items-start gap-2">
        <span
          className={`shrink-0 uppercase tracking-widest px-1.5 py-0.5 rounded border font-medium ${toneClasses.badge}`}
        >
          {badge.label}
        </span>
        <div className="min-w-0 space-y-1">
          {status.kind === 'remapped' && (
            <p className="text-[var(--pw-text-muted)]">
              KJV reference{' '}
              <span className="font-mono text-[var(--pw-text-soft)]">{status.kjvRef}</span> — Hebrew
              from OSHB{' '}
              <span className="font-mono text-[var(--pw-text-soft)]">{status.hebrewRef}</span>
            </p>
          )}
          {status.kind === 'kjv-only' && (
            <p className="text-[var(--pw-text-muted)]">
              KJV reference{' '}
              <span className="font-mono text-[var(--pw-text-soft)]">{status.kjvRef}</span> — no OSHB
              Hebrew at this verse
            </p>
          )}
          <p>{status.summary}</p>
        </div>
      </div>
    </div>
  );
}