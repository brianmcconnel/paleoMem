'use client';

import React, { useState } from 'react';
import { Header } from '../components/Header';
import { VerseNavigator } from '../components/VerseNavigator';
import { VerseDisplay } from '../components/VerseDisplay';
import { Interlinear } from '../components/Interlinear';
import { VerseMeanings } from '../components/VerseMeanings';
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

  const handleRefChange = (ref: string) => {
    setCurrentRef(ref);
    setSelectedWordId(null);
    setSelectedLetter(null);
  };

  const handleSelectWord = (word: InterlinearWord) => {
    setSelectedWordId(word.id);
    setSelectedLetter(null);
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
          className="sticky top-12 z-30 -mx-6 px-6 pt-2 pb-3 mb-3 bg-[var(--pw-bg-app)] border-b border-[var(--pw-border)] shadow-[0_8px_32px_var(--pw-shadow)] max-h-[min(55vh,560px)] overflow-y-auto"
        >
          <div className="mb-2">
            <VerseNavigator currentRef={currentRef} onSelect={handleRefChange} />
          </div>

          <div className="mb-2">
            <VerseDisplay
              verse={hasData ? displayVerse : undefined}
              selectedRef={selectedRef}
              selectedWordId={selectedWordId}
              onWordSelect={handleSelectWord}
            />
            {!hasData && (
              <div className="mt-1 text-xs text-[var(--pw-text-faint)]">
                Data for {selectedRef} not available (full OT Hebrew loaded from OSHB open source).
              </div>
            )}
          </div>

          <div>
            {hasData ? (
              <div
                className="scripture-hebrew text-[var(--pw-hebrew)] bg-[var(--pw-bg-surface)] border border-[var(--pw-border)] p-3 rounded-lg text-xl leading-relaxed select-none"
                dir="rtl"
                title="Hebrew — read right to left; click a letter to select its word"
              >
                {displayVerse.words.map((word, wi) => {
                  const isWordSelected = selectedWordId === word.id;
                  return (
                    <span
                      key={wi}
                      className={isWordSelected ? 'word-in-passage' : undefined}
                    >
                      {Array.from(word.hebrew).map((ch, ci) => {
                        const base = stripPoints(ch);
                        const isLetterHighlighted =
                          !!selectedLetter && base === selectedLetter;
                        const isConsonant = !!base && /[א-ת]/.test(base);
                        return (
                          <span
                            key={`${wi}-${ci}`}
                            className={
                              isLetterHighlighted
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
                    </span>
                  );
                })}
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
          <div id="insights" className="mb-8 space-y-10">
            <Interlinear
              words={displayVerse.words}
              selectedId={selectedWordId}
              selectedLetter={selectedLetter}
              onSelect={handleSelectWord}
              onLetterClick={handleLetterClick}
            />

            <VerseMeanings
              words={displayVerse.words}
              selectedWordId={selectedWordId}
              onSelect={handleSelectWord}
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
