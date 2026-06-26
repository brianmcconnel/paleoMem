'use client';

import React from 'react';
import type { AramaicScope } from '../lib/aramaic';
import { AramaicBadge } from './AramaicBadge';
import type { NumberingStatus } from '../lib/kjv-numbering';
import { VerseNumberingWarning } from './VerseNumberingWarning';
import { InfoIcon } from './InfoIcon';
import { HebrewRtlBadge, HebrewRtlNote } from './HebrewRtlHint';
import { useReadingHelp } from './ReadingHelpContext';

interface HebrewReaderPanelProps {
  children: React.ReactNode;
  aramaicScope?: AramaicScope;
  numberingStatus?: NumberingStatus;
  hasHebrewWords?: boolean;
}

export function HebrewReaderPanel({
  children,
  aramaicScope = 'none',
  numberingStatus,
  hasHebrewWords = true,
}: HebrewReaderPanelProps) {
  const { ready, minimized, toggleMinimized } = useReadingHelp();

  return (
    <div className="card p-3">
      <div className="flex items-start justify-between gap-3">
        <div
          className="scripture-hebrew text-[var(--pw-hebrew)] text-xl leading-relaxed select-none flex-1 min-w-0"
          dir="rtl"
          title="Hebrew — read right to left; click a letter to select its word"
        >
          {children}
        </div>

        <button
          type="button"
          onClick={toggleMinimized}
          className={`shrink-0 rounded p-0.5 pt-0.5 transition-colors ${
            ready && minimized
              ? 'text-[var(--pw-accent-gold)]'
              : 'text-[var(--pw-text-muted)] hover:text-[var(--pw-accent-gold)]'
          }`}
          title={
            minimized ? 'Show Hebrew reading help' : 'Hide Hebrew reading help'
          }
          aria-pressed={ready && !minimized}
          aria-label={
            minimized ? 'Show Hebrew reading help' : 'Hide Hebrew reading help'
          }
        >
          <InfoIcon />
        </button>
      </div>

      {numberingStatus && <VerseNumberingWarning status={numberingStatus} />}
      {!hasHebrewWords && numberingStatus?.kind !== 'kjv-only' && (
        <p className="text-sm text-[var(--pw-text-muted)]">
          No OSHB Hebrew text is available for this KJV reference.
        </p>
      )}
      {aramaicScope !== 'none' && <AramaicBadge scope={aramaicScope} />}

      {ready && !minimized && (
        <div className="mt-2 space-y-2">
          <HebrewRtlBadge className="inline-block" />
          <HebrewRtlNote className="p-0" />
        </div>
      )}
    </div>
  );
}