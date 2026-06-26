'use client';

import React from 'react';

export function FaqItem({ question, children }: { question: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-lg border border-[var(--pw-border)] bg-[var(--pw-bg-elevated)]/40 open:bg-[var(--pw-bg-elevated)]/70 transition-colors">
      <summary className="cursor-pointer list-none px-4 py-3.5 flex items-start justify-between gap-3 text-sm font-medium text-[var(--pw-text)] marker:content-none [&::-webkit-details-marker]:hidden">
        <span>{question}</span>
        <span
          className="shrink-0 text-[var(--pw-text-muted)] group-open:rotate-180 transition-transform"
          aria-hidden
        >
          ▾
        </span>
      </summary>
      <div className="px-4 pb-4 text-sm text-[var(--pw-text-soft)] leading-relaxed space-y-3 border-t border-[var(--pw-border)]/60 pt-3">
        {children}
      </div>
    </details>
  );
}