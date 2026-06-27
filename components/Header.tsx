'use client';

import React from 'react';
import { AppMenu } from './AppMenu';

export function Header() {
  return (
    <header className="h-12 shrink-0 border-b border-[var(--pw-border)] bg-[var(--pw-bg-app)] sticky top-0 z-50">
      <div className="h-full max-w-6xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded bg-[var(--pw-accent-gold)] flex items-center justify-center text-[var(--pw-on-gold)] font-bold text-lg shrink-0 scripture-hebrew leading-none">
            מ
          </div>
          <div className="min-w-0 flex items-baseline gap-2">
            <div className="font-semibold text-base tracking-tight shrink-0">paleoMem</div>
            <div className="text-[10px] text-[var(--pw-text-muted)] truncate hidden sm:block">
              KJV • Hebrew Interlinear • Pictographs
            </div>
          </div>
        </div>

        <AppMenu variant="paleo" />
      </div>
    </header>
  );
}