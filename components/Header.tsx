'use client';

import React from 'react';
import { HebrewFontToggle } from './HebrewFontToggle';
import { ThemeToggle } from './ThemeToggle';

const HEADER_OFFSET = 48; // matches h-12

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;

  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  window.dispatchEvent(new CustomEvent('paleomem:collapse-picker'));
}

export function Header() {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    scrollToSection(id);
    window.history.replaceState(null, '', `#${id}`);
  };

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

        <nav className="flex items-center gap-2 sm:gap-3 text-sm shrink-0">
          <HebrewFontToggle />
          <ThemeToggle />
          <a
            href="#reader"
            onClick={(e) => handleNavClick(e, 'reader')}
            className="hover:text-[var(--pw-accent-gold)] transition-colors"
          >
            Reader
          </a>
          <a
            href="#insights"
            onClick={(e) => handleNavClick(e, 'insights')}
            className="hover:text-[var(--pw-accent-gold)] transition-colors hidden sm:inline"
          >
            Insights
          </a>
          <a
            href="#faq"
            onClick={(e) => handleNavClick(e, 'faq')}
            className="hover:text-[var(--pw-accent-gold)] transition-colors hidden sm:inline"
          >
            FAQ
          </a>
          <a
            href="#datasources"
            onClick={(e) => handleNavClick(e, 'datasources')}
            className="hover:text-[var(--pw-accent-gold)] transition-colors hidden sm:inline"
          >
            Sources
          </a>
          <a
            href="https://github.com/brianmcconnel/paleoMem"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--pw-text-muted)] hover:text-[var(--pw-text)] hidden md:inline"
          >
            GitHub
          </a>
          <div className="text-[var(--pw-text-faint)] text-[10px] px-2 py-0.5 rounded bg-[var(--pw-bg-surface)] border border-[var(--pw-border)] hidden sm:block">
            OT
          </div>
        </nav>
      </div>
    </header>
  );
}