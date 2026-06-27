'use client';

import React from 'react';
import { AppMenu } from '../AppMenu';

export function VavHeader() {
  return (
    <header className="h-12 shrink-0 border-b border-[var(--pw-border)] bg-[var(--pw-bg-app)] sticky top-0 z-50">
      <div className="h-full max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="vav-mark w-7 h-7 rounded flex items-center justify-center font-bold text-lg shrink-0 scripture-hebrew leading-none">
            ו
          </div>
          <div className="min-w-0 flex items-baseline gap-2">
            <div className="font-semibold text-base tracking-tight shrink-0 vav-title">Vav</div>
            <div className="text-[10px] text-[var(--pw-text-muted)] truncate hidden sm:block">
              KJV • Scripture links • OT &amp; NT
            </div>
          </div>
        </div>

        <AppMenu variant="vav" />
      </div>
    </header>
  );
}