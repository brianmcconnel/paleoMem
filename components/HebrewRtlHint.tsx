import React from 'react';

export const HEBREW_RTL_LABEL = 'Finish <-- Hebrew <-- Start';

export const HEBREW_RTL_TITLE =
  'Hebrew reads right to left — begin at Start (right), read toward Finish (left)';

export function HebrewRtlBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`text-[10px] tracking-wide text-[var(--pw-text-muted)] font-mono bg-[var(--pw-bg-elevated)] border border-[var(--pw-border)] px-2 py-0.5 rounded ${className}`}
      title={HEBREW_RTL_TITLE}
    >
      {HEBREW_RTL_LABEL}
    </span>
  );
}

export function HebrewRtlNote({ className = '' }: { className?: string }) {
  return (
    <p className={`text-[10px] leading-relaxed text-[var(--pw-text-faint)] ${className}`}>
      <span className="text-[var(--pw-text-muted)]">Hebrew reads right to left</span> — follow{' '}
      <span className="font-mono text-[var(--pw-text-muted)]">{HEBREW_RTL_LABEL}</span>{' '}
      (begin at <em>Start</em> on the right, read toward <em>Finish</em> on the left).
    </p>
  );
}