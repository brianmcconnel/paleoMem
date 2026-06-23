'use client';

import React, { useState } from 'react';
import { Header } from '../components/Header';
import { VerseNavigator } from '../components/VerseNavigator';
import { VerseDisplay } from '../components/VerseDisplay';
import { Interlinear } from '../components/Interlinear';
import { DatasourcesTribute } from '../components/DatasourcesTribute';
import { getVerse, DEFAULT_VERSE, InterlinearWord } from '../data/verses';
import { stripPoints } from '../lib/pictograph';

export default function paleoMemPage() {
  const [currentRef, setCurrentRef] = useState<string>(DEFAULT_VERSE.ref);
  const [selectedWordId, setSelectedWordId] = useState<number | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const selectedRef = currentRef;
  const verseData = getVerse(selectedRef);
  const hasData = !!verseData;
  const displayVerse = verseData ?? DEFAULT_VERSE;

  // Note: selection state is derived from currentRef + displayVerse in computations below.
  // No explicit reset effect to avoid setState-in-effect lint rule.

  // Selected word for this verse (falls back gracefully to first word)
  const selectedInterlinearWord: InterlinearWord | null = hasData
    ? (displayVerse.words.find(w => w.id === selectedWordId) ?? displayVerse.words[0] ?? null)
    : null;

  const handleSelectWord = (word: InterlinearWord) => {
    setSelectedWordId(word.id);
    setSelectedLetter(null); // clear letter when changing words
  };

  const handleLetterClick = (letter: string) => {
    setSelectedLetter(letter === selectedLetter ? null : letter);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-6 py-4 sm:py-5 w-full">
        {/* Sticky reader: navigator + KJV + Hebrew always visible while scrolling */}
        <div
          id="reader"
          className="sticky top-12 z-30 -mx-6 px-6 pt-2 pb-4 mb-4 bg-[var(--pw-bg-app)] border-b border-[var(--pw-border)] shadow-[0_8px_32px_var(--pw-shadow)] max-h-[min(55vh,560px)] overflow-y-auto"
        >
          <div className="mb-4">
            <VerseNavigator currentRef={currentRef} onSelect={setCurrentRef} />
          </div>

          <div className="mb-4 [&_.card]:p-4">
            <VerseDisplay verse={hasData ? displayVerse : undefined} selectedRef={selectedRef} />
            {!hasData && (
              <div className="mt-2 text-xs text-[var(--pw-text-faint)]">
                Data for {selectedRef} not available (full OT Hebrew loaded from OSHB open source).
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div className="text-sm font-medium tracking-widest uppercase text-[var(--pw-text-muted)]">
                Hebrew Passage — click any letter to select its word (Strong’s) + pictograph
              </div>
              <div
                className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[var(--pw-accent-gold)] px-2 py-0.5 rounded border border-[var(--pw-border)] bg-[var(--pw-bg-panel)]"
                title="Hebrew is read from right to left"
              >
                <span>End</span>
                <span className="text-[var(--pw-text-faint)]" aria-hidden="true">
                  &lt;
                </span>
                <span className="text-[var(--pw-text-faint)] normal-case tracking-normal">
                  Read right to left
                </span>
                <span className="text-[var(--pw-text-faint)]" aria-hidden="true">
                  &lt;
                </span>
                <span>Start</span>
              </div>
            </div>
            {hasData ? (
              <div
                className="scripture-hebrew text-[var(--pw-hebrew)] bg-[var(--pw-bg-surface)] border border-[var(--pw-border)] p-4 rounded-xl text-xl leading-relaxed select-none"
                dir="rtl"
              >
                {displayVerse.words.map((word, wi) => (
                  <React.Fragment key={wi}>
                    {Array.from(word.hebrew).map((ch, ci) => {
                      const base = stripPoints(ch);
                      const isHighlighted = !!selectedLetter && base === selectedLetter;
                      const isConsonant = !!base && /[א-ת]/.test(base);
                      return (
                        <span
                          key={`${wi}-${ci}`}
                          className={
                            isHighlighted
                              ? 'letter-in-passage'
                              : isConsonant
                                ? 'cursor-pointer hover:bg-[var(--pw-accent-gold)]/20 rounded-sm'
                                : ''
                          }
                          title={base ? `Click to select ${word.strongs} • letter ${base}` : ''}
                          onClick={() => {
                            if (isConsonant && base) {
                              setSelectedWordId(word.id);
                              setSelectedLetter(base);
                            }
                          }}
                        >
                          {ch}
                        </span>
                      );
                    })}
                    {wi < displayVerse.words.length - 1 && ' '}
                  </React.Fragment>
                ))}
                {displayVerse.hebrew.match(/[׃]$/) && '׃'}
              </div>
            ) : (
              <div className="bg-[var(--pw-bg-surface)] border border-[var(--pw-border)] p-4 rounded-xl text-[var(--pw-text-muted)]">
                Hebrew for {selectedRef} not found in OSHB data.
              </div>
            )}
          </div>
        </div>

        {/* Interlinear + pictograph letter cards (one row per word) */}
        {hasData && (
          <div id="insights" className="mb-8">
            <Interlinear
              words={displayVerse.words}
              selectedId={selectedInterlinearWord?.id ?? null}
              selectedLetter={selectedLetter}
              onSelect={handleSelectWord}
              onLetterClick={handleLetterClick}
            />
          </div>
        )}

        {/* Datasources & Tribute to Chuck Missler */}
        <DatasourcesTribute />

        {/* Footer info */}
        <div className="text-xs text-[var(--pw-text-faint)] border-t border-[var(--pw-border)] pt-6 pb-10">
          Clean lib-first, deterministic core, beautiful reverent UI.
          <br />
          Full Old Testament navigation. Hebrew RTL. Strong’s → Blue Letter Bible + pictographs.
          <span className="ml-2 text-[var(--pw-accent-gold)]">v0.3 — Full OT Navigator</span>
          <br />
          © 2026 Brian McConnel
        </div>
      </main>
    </div>
  );
}
