'use client';

import React from 'react';

export function Header() {
  return (
    <header className="border-b border-[var(--pw-border)] bg-[var(--pw-bg-app)]/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[var(--pw-accent-gold)] flex items-center justify-center text-[#0b1118] font-bold text-xl tracking-[-2px]">
            א
          </div>
          <div>
            <div className="font-semibold text-xl tracking-tight">paleoMem</div>
            <div className="text-[10px] text-[var(--pw-text-muted)] -mt-1">
              Paleo-Hebrew Pictographs in Scripture
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <a href="#reader" className="hover:text-[var(--pw-accent-gold)] transition-colors">
            Reader
          </a>
          <a href="#insights" className="hover:text-[var(--pw-accent-gold)] transition-colors">
            Insights
          </a>
          <a href="#datasources" className="hover:text-[var(--pw-accent-gold)] transition-colors">
            Sources
          </a>
          <a
            href="https://github.com"
            target="_blank"
            className="text-[var(--pw-text-muted)] hover:text-[var(--pw-text)]"
          >
            GitHub
          </a>
          <div className="text-[var(--pw-text-faint)] text-xs px-2 py-0.5 rounded bg-[var(--pw-bg-surface)] border border-[var(--pw-border)]">
            WEB + Paleo
          </div>
        </div>
      </div>
    </header>
  );
}
