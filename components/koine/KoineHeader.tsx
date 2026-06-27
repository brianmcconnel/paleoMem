'use client';

import React from 'react';
import { AppMenu } from '../AppMenu';

export function KoineHeader() {
  return (
    <header className="h-12 shrink-0 border-b border-[var(--pw-border)] bg-[var(--pw-bg-app)] sticky top-0 z-50">
      <div className="h-full max-w-6xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded bg-[var(--pw-accent)] flex items-center justify-center text-[var(--pw-bg-app)] font-bold text-lg shrink-0 scripture-greek leading-none">
            μ
          </div>
          <div className="min-w-0 flex items-baseline gap-2">
            <div className="font-semibold text-base tracking-tight shrink-0">koineHydata</div>
            <div className="text-[10px] text-[var(--pw-text-muted)] truncate hidden sm:block">
              KJV • Koine Greek • Word insights
            </div>
          </div>
        </div>

        <AppMenu variant="koine" />
      </div>
    </header>
  );
}