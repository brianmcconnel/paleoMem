'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { HelpInterlinearExample } from './HelpInterlinearExample';
import { HebrewRtlNote, HEBREW_RTL_LABEL } from './HebrewRtlHint';
import { InfoIcon } from './InfoIcon';
import { KoineHelpContent } from './koine/KoineHelpContent';
import { VavHelpContent } from './vav/VavHelpContent';
import { scrollToSection } from '../lib/scroll-section';
import {
  hasKoineVisitedBefore,
  hasVavVisitedBefore,
  hasVisitedBefore,
  markKoineVisited,
  markVavVisited,
  markVisited,
} from '../lib/site-cookies';

type HelpVariant = 'paleo' | 'koine' | 'vav';

function getHelpVariant(pathname: string): HelpVariant {
  if (pathname === '/vav' || pathname.startsWith('/vav/')) return 'vav';
  if (pathname === '/koine' || pathname.startsWith('/koine/')) return 'koine';
  return 'paleo';
}

function scrollToDedication() {
  scrollToSection('dedication');
  window.history.replaceState(null, '', '#dedication');
}

function PaleoHelpContent({ onDedicationClick }: { onDedicationClick: () => void }) {
  return (
    <div className="space-y-5 text-sm leading-relaxed text-[var(--pw-text-soft)]">
      <p>
        <span className="font-medium text-[var(--pw-text)]">paleoMem</span> is a scripture study
        reader for the Old Testament. It places King James English beside pointed Hebrew,
        Strong&apos;s numbers, and Paleo-Hebrew pictograph analysis — letter by letter.
      </p>

      <p className="text-xs text-[var(--pw-text-faint)] border-l-2 border-[var(--pw-accent-gold)] pl-3 leading-relaxed">
        Inspired by Chuck Missler&apos;s enthusiastic, letter-by-letter study of the Bible — that
        every letter is God-breathed. We especially recommend watching his explanation:{' '}
        <a
          href="https://www.youtube.com/watch?v=HtRdQeGm_7Q"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--pw-link)] hover:underline font-medium"
        >
          The Hebrew Language and Bible Codes
        </a>{' '}
        (YouTube).{' '}
        <a
          href="#dedication"
          onClick={(e) => {
            e.preventDefault();
            onDedicationClick();
          }}
          className="text-[var(--pw-link)] hover:underline"
        >
          Read more in the dedication
        </a>
        .
      </p>

      <div className="rounded-lg border border-[var(--pw-border)] bg-[var(--pw-bg-elevated)]/50 px-3 py-2.5">
        <HebrewRtlNote alwaysShow />
      </div>

      <div>
        <div className="text-xs font-semibold uppercase tracking-widest text-[var(--pw-accent-gold)] mb-2">
          How to use
        </div>
        <ol className="space-y-2 list-decimal list-inside text-[var(--pw-text-muted)]">
          <li>
            <span className="text-[var(--pw-text-soft)]">
              Pick any OT verse with the navigator (book, chapter, verse, prev/next).
            </span>
          </li>
          <li>
            <span className="text-[var(--pw-text-soft)]">
              Read KJV and Hebrew together in the reader. Hebrew runs right to left — follow the{' '}
              <span className="font-mono text-[var(--pw-text-muted)]">{HEBREW_RTL_LABEL}</span>{' '}
              badge (begin at <em>Start</em> on the right, read toward <em>Finish</em> on the left).
              Click a <span className="text-[var(--pw-accent-gold)]">KJV</span> word or Hebrew
              letter to highlight the matching word.
            </span>
          </li>
          <li>
            <span className="text-[var(--pw-text-soft)]">
              Scroll to <strong className="font-medium text-[var(--pw-text)]">Interlinear</strong>{' '}
              rows — each word has a Strong&apos;s card plus pictograph letter cards. Click a
              Strong&apos;s number to open Blue Letter Bible.
            </span>
          </li>
        </ol>
      </div>

      <HelpInterlinearExample />

      <div>
        <div className="text-xs font-semibold uppercase tracking-widest text-[var(--pw-accent-gold)] mb-2">
          The method
        </div>
        <p>
          Hebrew letters began as pictures — an ox head, a house, water, a shepherd&apos;s staff.
          paleoMem reads each word as both its established lexical meaning (via Strong&apos;s and
          the plain text) and as a chain of ancient letter symbols that often reinforce the
          word&apos;s sense.
        </p>
        <p className="mt-2 text-xs text-[var(--pw-text-faint)]">
          Pictographs are a study layer meant to deepen meditation, not replace grammar or context.
          Always anchor insight in the plain reading of Scripture.
        </p>
      </div>
    </div>
  );
}

const HELP_META: Record<
  HelpVariant,
  {
    title: string;
    subtitle: string;
    fabTitle: string;
    fabOpen: string;
    fabClosed: string;
    fabOpenClass: string;
    fabClosedClass: string;
    ctaClass: string;
  }
> = {
  paleo: {
    title: 'Welcome to paleoMem',
    subtitle: 'Quick guide to reading Hebrew with pictographs',
    fabTitle: 'How to use paleoMem',
    fabOpen: 'Close help guide',
    fabClosed: 'Open help guide',
    fabOpenClass:
      'bg-[var(--pw-bg-panel)] border-[var(--pw-accent-gold)] text-[var(--pw-accent-gold)]',
    fabClosedClass:
      'bg-[var(--pw-accent-gold)] border-[var(--pw-accent-gold)] text-[var(--pw-on-gold)] hover:bg-[var(--pw-accent-gold-hover)]',
    ctaClass: 'btn btn-gold',
  },
  koine: {
    title: 'Welcome to koineHydata',
    subtitle: 'Quick guide to reading NT Greek with word insights',
    fabTitle: 'How to use koineHydata',
    fabOpen: 'Close koineHydata help',
    fabClosed: 'Open koineHydata help',
    fabOpenClass: 'bg-[var(--pw-bg-panel)] border-[var(--pw-accent)] text-[var(--pw-accent)]',
    fabClosedClass:
      'bg-[var(--pw-accent)] border-[var(--pw-accent)] text-white hover:bg-[var(--pw-accent-hover)]',
    ctaClass: 'btn btn-primary',
  },
  vav: {
    title: 'Welcome to Vav',
    subtitle: 'Quick guide to exploring scripture cross-references',
    fabTitle: 'How to use Vav',
    fabOpen: 'Close Vav help',
    fabClosed: 'Open Vav help',
    fabOpenClass:
      'bg-[var(--pw-bg-panel)] border-[var(--pw-vav-accent)] text-[var(--pw-vav-accent)]',
    fabClosedClass:
      'border-[var(--pw-vav-accent)] text-[var(--pw-on-vav-mark)] hover:brightness-110',
    ctaClass: 'btn btn-gold',
  },
};

const VAV_HELP_GRADIENT = 'linear-gradient(135deg, var(--pw-accent-gold), var(--pw-vav-accent))';

export function HelpGuide() {
  const pathname = usePathname();
  const variant = getHelpVariant(pathname ?? '/');
  const meta = HELP_META[variant];

  const [ready, setReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const visited =
      variant === 'vav'
        ? hasVavVisitedBefore()
        : variant === 'koine'
          ? hasKoineVisitedBefore()
          : hasVisitedBefore();
    setIsOpen(!visited);
    setReady(true);
  }, [variant]);

  const closeHelp = () => {
    if (variant === 'vav') {
      markVavVisited();
    } else if (variant === 'koine') {
      markKoineVisited();
    } else {
      markVisited();
    }
    setIsOpen(false);
  };

  const goToDedication = () => {
    closeHelp();
    requestAnimationFrame(() => scrollToDedication());
  };

  if (!ready) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3 max-w-[calc(100vw-2.5rem)] pointer-events-none">
      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close help"
            className="fixed inset-0 bg-[var(--pw-modal)] backdrop-blur-[2px] pointer-events-auto"
            onClick={closeHelp}
          />
          <div
            role="dialog"
            aria-labelledby="help-guide-title"
            aria-modal="true"
            className="relative z-10 pointer-events-auto w-[min(100vw-2.5rem,28rem)] max-h-[min(85vh,36rem)] overflow-y-auto rounded-xl border border-[var(--pw-border)] bg-[var(--pw-bg-panel)] shadow-2xl p-5"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2
                  id="help-guide-title"
                  className="text-lg font-semibold tracking-tight text-[var(--pw-text)]"
                >
                  {meta.title}
                </h2>
                <p className="text-xs text-[var(--pw-text-muted)] mt-0.5">{meta.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={closeHelp}
                className="shrink-0 text-[var(--pw-text-muted)] hover:text-[var(--pw-text)] p-1 rounded transition-colors"
                aria-label="Close help panel"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-5"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {variant === 'vav' ? (
              <VavHelpContent />
            ) : variant === 'koine' ? (
              <KoineHelpContent />
            ) : (
              <PaleoHelpContent onDedicationClick={goToDedication} />
            )}

            <button
              type="button"
              onClick={closeHelp}
              className={`mt-5 w-full text-sm font-medium ${meta.ctaClass}`}
              style={
                variant === 'vav'
                  ? {
                      background: VAV_HELP_GRADIENT,
                      borderColor: 'var(--pw-vav-accent)',
                      color: 'var(--pw-on-vav-mark)',
                    }
                  : undefined
              }
            >
              {variant === 'vav' ? 'Got it — start exploring' : 'Got it — start reading'}
            </button>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={() => (isOpen ? closeHelp() : setIsOpen(true))}
        className={`pointer-events-auto relative z-20 flex items-center justify-center w-11 h-11 rounded-full border shadow-lg transition-all ${
          isOpen ? meta.fabOpenClass : meta.fabClosedClass
        }`}
        style={
          variant === 'vav' && !isOpen
            ? { background: VAV_HELP_GRADIENT, borderColor: 'var(--pw-vav-accent)' }
            : undefined
        }
        aria-label={isOpen ? meta.fabOpen : meta.fabClosed}
        aria-expanded={isOpen}
        title={meta.fabTitle}
      >
        <InfoIcon className="w-5 h-5" />
      </button>
    </div>
  );
}