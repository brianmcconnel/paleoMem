'use client';

import React from 'react';
import {
  getAramaicScopeHint,
  getAramaicScopeLabel,
  type AramaicScope,
} from '../lib/aramaic';

export function AramaicBadge({ scope }: { scope: AramaicScope }) {
  const label = getAramaicScopeLabel(scope);
  const hint = getAramaicScopeHint(scope);

  if (!label || !hint) return null;

  return (
    <div
      className="flex items-start gap-2 text-[10px] leading-snug text-[var(--pw-text-muted)] border-t border-[var(--pw-border)]/70 pt-2 mt-2"
      role="note"
    >
      <span className="shrink-0 uppercase tracking-widest px-1.5 py-0.5 rounded border border-[var(--pw-border)] bg-[var(--pw-bg-elevated)] text-[var(--pw-text-subtle)] font-medium">
        {scope === 'full' ? 'Aram' : 'Aram · mixed'}
      </span>
      <span>
        <span className="text-[var(--pw-text-soft)] font-medium">{label}.</span> {hint}
      </span>
    </div>
  );
}