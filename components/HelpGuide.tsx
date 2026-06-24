'use client';

import React, { useEffect, useState } from 'react';
import { hasVisitedBefore, markVisited } from '../lib/visitor-cookie';

function InfoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

const HEADER_OFFSET = 48;

function scrollToDedication() {
  const el = document.getElementById('dedication');
  if (!el) return;

  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  window.history.replaceState(null, '', '#dedication');
  window.dispatchEvent(new CustomEvent('paleomem:collapse-picker'));
}

function HelpContent({ onDedicationClick }: { onDedicationClick: () => void }) {
  return (
    <div className="space-y-5 text-sm leading-relaxed text-[var(--pw-text-soft)]">
      <p>
        <span className="font-medium text-[var(--pw-text)]">paleoMem</span> is a scripture
        study reader for the Old Testament. It places King James English beside pointed Hebrew,
        Strong&apos;s numbers, and Paleo-Hebrew pictograph analysis — letter by letter.
      </p>

      <p className="text-xs text-[var(--pw-text-faint)] border-l-2 border-[var(--pw-accent-gold)] pl-3 leading-relaxed">
        Inspired by Chuck Missler&apos;s enthusiastic, letter-by-letter study of the Bible — that
        every letter is God-breathed.{' '}
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
              <span className="font-mono text-[var(--pw-text-muted)]">end &lt; text &lt; start</span>{' '}
              badge (begin at <em>start</em> on the right, read toward <em>end</em> on the left).
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
          <li>
            <span className="text-[var(--pw-text-soft)]">
              Below that, <strong className="font-medium text-[var(--pw-text)]">Pictographic Verse
              Meaning</strong> builds a whole-verse symbolic reading, practical sense, and emoji
              string. Word chips link back to individual terms.
            </span>
          </li>
        </ol>
      </div>

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

export function HelpGuide() {
  const [ready, setReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const visited = hasVisitedBefore();
    setIsOpen(!visited);
    setReady(true);
  }, []);

  const closeHelp = () => {
    markVisited();
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
            className="relative z-10 pointer-events-auto w-[min(100vw-2.5rem,26rem)] max-h-[min(80vh,32rem)] overflow-y-auto rounded-xl border border-[var(--pw-border)] bg-[var(--pw-bg-panel)] shadow-2xl p-5"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2
                  id="help-guide-title"
                  className="text-lg font-semibold tracking-tight text-[var(--pw-text)]"
                >
                  Welcome to paleoMem
                </h2>
                <p className="text-xs text-[var(--pw-text-muted)] mt-0.5">
                  Quick guide to reading Hebrew with pictographs
                </p>
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

            <HelpContent onDedicationClick={goToDedication} />

            <button
              type="button"
              onClick={closeHelp}
              className="mt-5 w-full btn btn-gold text-sm font-medium"
            >
              Got it — start reading
            </button>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={() => (isOpen ? closeHelp() : setIsOpen(true))}
        className={`pointer-events-auto relative z-20 flex items-center justify-center w-11 h-11 rounded-full border shadow-lg transition-all ${
          isOpen
            ? 'bg-[var(--pw-bg-panel)] border-[var(--pw-accent-gold)] text-[var(--pw-accent-gold)]'
            : 'bg-[var(--pw-accent-gold)] border-[var(--pw-accent-gold)] text-[#0b1118] hover:bg-[var(--pw-accent-gold-hover)]'
        }`}
        aria-label={isOpen ? 'Close help guide' : 'Open help guide'}
        aria-expanded={isOpen}
        title="How to use paleoMem"
      >
        <InfoIcon />
      </button>
    </div>
  );
}