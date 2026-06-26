'use client';

import React from 'react';
import Link from 'next/link';
import { scrollToSection } from '../../lib/scroll-section';
import { ThemeToggle } from '../ThemeToggle';

export function KoineHeader() {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    scrollToSection(id);
    window.history.replaceState(null, '', `#${id}`);
  };

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

        <nav className="flex items-center gap-2 sm:gap-3 text-sm shrink-0">
          <ThemeToggle />
          <Link
            href="/"
            className="hover:text-[var(--pw-accent)] transition-colors hidden sm:inline"
          >
            paleoMem
          </Link>
          <a
            href="#insights"
            onClick={(e) => handleNavClick(e, 'insights')}
            className="hover:text-[var(--pw-accent)] transition-colors hidden sm:inline"
          >
            Insights
          </a>
          <a
            href="#faq"
            onClick={(e) => handleNavClick(e, 'faq')}
            className="hover:text-[var(--pw-accent)] transition-colors hidden sm:inline"
          >
            FAQ
          </a>
          <a
            href="#sources"
            onClick={(e) => handleNavClick(e, 'sources')}
            className="hover:text-[var(--pw-accent)] transition-colors hidden sm:inline"
          >
            Sources
          </a>
          <div className="text-[var(--pw-text-faint)] text-[10px] px-2 py-0.5 rounded bg-[var(--pw-bg-surface)] border border-[var(--pw-border)] hidden sm:block">
            NT
          </div>
        </nav>
      </div>
    </header>
  );
}