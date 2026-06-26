'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_KOINE_VERSE } from '../../data/greek-nt';
import type { GreekInterlinearWord } from '../../data/greek-nt';
import { getBlueLetterBibleUrl } from '../../lib/pictograph';
import { getStrongs, getStrongsDisplay } from '../../lib/strongs';
import { GreekWordInsightCard } from './GreekWordInsightCard';

const FALLBACK_WORD: GreekInterlinearWord = {
  id: 3,
  greek: 'λόγος',
  strongs: 'G3056',
  transliteration: 'logos',
  gloss: 'Word',
};

const WORDS_TO_DEMO = (() => {
  const picked = DEFAULT_KOINE_VERSE.words.filter((w) =>
    ['G3056', 'G746', 'G2316'].includes(w.strongs),
  );
  return picked.length > 0 ? picked : [FALLBACK_WORD];
})();

export function KoineHelpInterlinearExample() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [demoActive, setDemoActive] = useState(true);
  const [demoId, setDemoId] = useState<number | null>(null);
  const demoRunRef = useRef(0);

  const activeId = demoActive ? demoId : selectedId;
  const activeWord = useMemo(
    () => WORDS_TO_DEMO.find((w) => w.id === activeId) ?? null,
    [activeId],
  );

  const stopDemo = () => {
    setDemoActive(false);
    setDemoId(null);
  };

  const selectWord = (word: GreekInterlinearWord) => {
    stopDemo();
    setSelectedId((current) => (current === word.id ? null : word.id));
  };

  useEffect(() => {
    if (!demoActive) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || WORDS_TO_DEMO.length === 0) {
      setDemoActive(false);
      return;
    }

    const runId = ++demoRunRef.current;
    const timers: number[] = [];
    const schedule = (fn: () => void, delay: number) => {
      timers.push(window.setTimeout(fn, delay));
    };

    let elapsed = 700;
    const wordMs = 1100;
    const gapMs = 500;

    for (const word of WORDS_TO_DEMO) {
      schedule(() => {
        if (demoRunRef.current !== runId) return;
        setDemoId(word.id);
      }, elapsed);
      elapsed += wordMs;
    }

    schedule(() => {
      if (demoRunRef.current !== runId) return;
      setDemoActive(false);
      setDemoId(null);
    }, elapsed + gapMs);

    return () => {
      demoRunRef.current += 1;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [demoActive]);

  const strongsDisplay = activeWord ? getStrongsDisplay(activeWord.strongs) : null;

  return (
    <div className="rounded-lg border border-[var(--pw-border)] bg-[var(--pw-bg-elevated)]/60 p-3 space-y-3">
      <div>
        <div className="text-xs font-semibold uppercase tracking-widest text-[var(--pw-accent)] mb-1">
          Try it — John 1:1
        </div>
        <p className="text-xs text-[var(--pw-text-muted)] leading-relaxed">
          Same layout as the reader: KJV on top, SBLGNT Greek below, then interlinear cards. Click a
          Greek word — its insight appears in the reader and in the row below.
        </p>
      </div>

      <div className="card p-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-widest text-[var(--pw-text-faint)] mb-1">
              John 1:1 · KJV
            </div>
            <div className="scripture-english text-sm leading-snug text-[var(--pw-english)]">
              In the beginning was the{' '}
              <span className="text-[var(--pw-accent)] font-medium">Word</span>, and the Word was
              with God…
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-[var(--pw-accent-gold)] shrink-0 pt-0.5">
            KJV
          </span>
        </div>
      </div>

      <div className={`card p-2.5 relative ${demoActive ? 'help-koine-demo-pulse' : ''}`}>
        {demoActive && (
          <span className="absolute top-1.5 left-2 text-[9px] uppercase tracking-widest text-[var(--pw-accent)]">
            Tap words
          </span>
        )}
        <div className="flex items-start justify-between gap-2 pt-3">
          <div
            className="scripture-greek text-[var(--pw-greek)] text-xl leading-relaxed flex-1 min-w-0"
            dir="ltr"
          >
            {WORDS_TO_DEMO.map((word, wi) => {
              const isActive = activeId === word.id;
              return (
                <span key={word.id}>
                  <button
                    type="button"
                    onClick={() => selectWord(word)}
                    className={`inline bg-transparent border-0 p-0 cursor-pointer rounded-sm ${
                      isActive
                        ? 'word-in-passage bg-[var(--pw-accent)]/25 ring-1 ring-[var(--pw-accent)]/50'
                        : 'hover:bg-[var(--pw-accent)]/10'
                    }`}
                  >
                    {word.greek}
                  </button>
                  {wi < WORDS_TO_DEMO.length - 1 && ' … '}
                </span>
              );
            })}
          </div>
          <span className="text-[10px] uppercase tracking-widest text-[var(--pw-accent)] shrink-0 pt-0.5">
            SBLGNT
          </span>
        </div>

        {activeWord && (
          <div className="mt-2">
            <GreekWordInsightCard word={activeWord} compact />
          </div>
        )}
      </div>

      <p className="text-[10px] text-[var(--pw-text-faint)] leading-relaxed">
        {demoActive ? (
          <>Words highlight one by one — try tapping them yourself.</>
        ) : activeWord ? (
          <>
            <span className="scripture-greek text-[var(--pw-greek)]">{activeWord.greek}</span> is
            selected above and in the interlinear card below.
          </>
        ) : (
          <>Select a Greek word in the box — its Strong&apos;s card and insight row will light up.</>
        )}
      </p>

      <div className="flex flex-nowrap items-stretch gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {WORDS_TO_DEMO.map((word) => {
          const isSelected = activeId === word.id;
          const display = getStrongsDisplay(word.strongs);
          const pronunciation = display.pronunciation || word.transliteration || '';

          return (
            <button
              key={word.id}
              type="button"
              onClick={() => selectWord(word)}
              className={`group shrink-0 text-left rounded-xl border p-2.5 min-w-[140px] max-w-[200px] transition-all card ${
                isSelected
                  ? 'border-[var(--pw-accent)] ring-2 ring-[var(--pw-accent)]/30 shadow-md'
                  : 'border-[var(--pw-border)] hover:border-[var(--pw-accent)]/60'
              }`}
              aria-pressed={isSelected}
            >
              <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1 mb-1">
                <span className="scripture-greek text-2xl text-[var(--pw-greek)] leading-none">
                  {word.greek}
                </span>
                <span
                  role="link"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(
                      getBlueLetterBibleUrl(word.strongs),
                      '_blank',
                      'noopener,noreferrer',
                    );
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      e.preventDefault();
                      window.open(
                        getBlueLetterBibleUrl(word.strongs),
                        '_blank',
                        'noopener,noreferrer',
                      );
                    }
                  }}
                  className={`font-mono text-[10px] px-1.5 py-px rounded border cursor-pointer hover:underline shrink-0 ${
                    isSelected
                      ? 'bg-[var(--pw-accent)] text-white border-[var(--pw-accent)] font-semibold'
                      : 'bg-[var(--pw-bg-elevated)] text-[var(--pw-accent)] border-[var(--pw-accent)]/50 hover:bg-[var(--pw-accent)]/10'
                  }`}
                  title={(() => {
                    const def = getStrongs(word.strongs);
                    const desc = def?.strongs_def || def?.kjv_def || '';
                    return `View ${word.strongs} on Blue Letter Bible${desc ? ' — ' + desc : ''}`;
                  })()}
                >
                  {word.strongs}
                </span>
              </div>

              <div dir="ltr" className="text-left">
                {pronunciation && (
                  <div className="text-xs font-medium text-[var(--pw-english)] leading-tight font-mono">
                    {pronunciation}
                  </div>
                )}
                {word.gloss && (
                  <div className="text-[10px] text-[var(--pw-text-muted)] mt-1 italic">
                    {word.gloss}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {activeWord && strongsDisplay?.definition && (
        <p className="text-[10px] text-[var(--pw-text-faint)] leading-relaxed">
          Full verses list every Greek word this way — Strong&apos;s card plus a word insight when
          curated (John 1:1 includes λόγος, ἀρχή, θεός).
        </p>
      )}
    </div>
  );
}