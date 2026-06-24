'use client';

import React from 'react';
import { useReadingHelp } from './ReadingHelpContext';

export const HEBREW_RTL_LABEL = 'Finish <-- Hebrew <-- Start';

export const HEBREW_RTL_TITLE =
  'Hebrew reads right to left — begin at Start (right), read toward Finish (left)';

export function HebrewRtlBadge({
  className = '',
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span
      className={`${
        compact ? 'text-[8px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
      } tracking-wide text-[var(--pw-text-muted)] font-mono bg-[var(--pw-bg-elevated)] border border-[var(--pw-border)] rounded ${className}`}
      title={HEBREW_RTL_TITLE}
    >
      {HEBREW_RTL_LABEL}
    </span>
  );
}

export function HebrewRtlNote({
  className = '',
  alwaysShow = false,
  compact = false,
}: {
  className?: string;
  alwaysShow?: boolean;
  compact?: boolean;
}) {
  const { ready, minimized } = useReadingHelp();

  if (ready && minimized && !alwaysShow) return null;

  return (
    <p
      className={`${
        compact ? 'text-[8px] leading-snug' : 'text-xs leading-relaxed'
      } text-[var(--pw-text-faint)] ${className}`}
    >
      <span className="text-[var(--pw-text-muted)]">Hebrew reads right to left</span> — follow{' '}
      <span className="font-mono text-[var(--pw-text-muted)]">{HEBREW_RTL_LABEL}</span>{' '}
      (begin at <em>Start</em> on the right, read toward <em>Finish</em> on the left).
    </p>
  );
}