'use client';

import React from 'react';
import { InfoIcon } from './InfoIcon';
import { HebrewRtlBadge, HebrewRtlNote } from './HebrewRtlHint';
import { useReadingHelp } from './ReadingHelpContext';

interface HebrewReaderPanelProps {
  children: React.ReactNode;
}

export function HebrewReaderPanel({ children }: HebrewReaderPanelProps) {
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

      {ready && !minimized && (
        <div className="mt-2 space-y-2">
          <HebrewRtlBadge className="inline-block" />
          <HebrewRtlNote className="p-0" />
        </div>
      )}
    </div>
  );
}