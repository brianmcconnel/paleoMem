'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { VerseNavigator } from '../components/VerseNavigator';
import { VerseDisplay } from '../components/VerseDisplay';
import { Interlinear } from '../components/Interlinear';
import { VerseMeanings } from '../components/VerseMeanings';
import { DatasourcesTribute } from '../components/DatasourcesTribute';
import { HebrewReaderPanel } from '../components/HebrewReaderPanel';
import { normalizeReference } from '../data/books';
import { getVerse, DEFAULT_VERSE, InterlinearWord } from '../data/verses';
import { getLastVerse, setLastVerse } from '../lib/site-cookies';
import { HebrewGraphemeText } from '../components/HebrewGraphemeText';

export default function paleoMemPage() {
  const [currentRef, setCurrentRef] = useState<string>(DEFAULT_VERSE.ref);
  const [verseReady, setVerseReady] = useState(false);
  const [selectedWordId, setSelectedWordId] = useState<number | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  useEffect(() => {
    const saved = getLastVerse();
    if (saved) {
      const normalized = normalizeReference(saved);
      if (getVerse(normalized)) {
        setCurrentRef(normalized);
      }
    }
    setVerseReady(true);
  }, []);

  useEffect(() => {
    if (!verseReady) return;
    setLastVerse(currentRef);
  }, [currentRef, verseReady]);

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
        {/* Reader: navigator + KJV + Hebrew always visible while scrolling */}
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
              <HebrewReaderPanel>
                {displayVerse.words.map((word, wi) => {
                  const isWordSelected = selectedWordId === word.id;
                  return (
                    <span
                      key={wi}
                      className={isWordSelected ? 'word-in-passage' : undefined}
                    >
                      <HebrewGraphemeText
                        text={word.hebrew}
                        selectedLetter={selectedLetter}
                        onConsonantClick={(consonant) => {
                          setSelectedWordId(word.id);
                          setSelectedLetter(consonant);
                        }}
                      />
                      {wi < displayVerse.words.length - 1 && ' '}
                    </span>
                  );
                })}
                {displayVerse.hebrew.match(/[׃]$/) && '׃'}
              </HebrewReaderPanel>
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

        <div className="text-xs text-[var(--pw-text-faint)] border-t border-[var(--pw-border)] pt-6 pb-10">
          © 2026 Brian McConnel
        </div>
      </main>
    </div>
  );
}
