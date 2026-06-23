'use client';

import React, { useState } from 'react';
import { Header } from '../components/Header';
import { VerseNavigator } from '../components/VerseNavigator';
import { VerseDisplay } from '../components/VerseDisplay';
import { Interlinear } from '../components/Interlinear';
import { PictographBreakdown } from '../components/PictographBreakdown';
import { AISummary } from '../components/AISummary';
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

      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
        {/* Hero / intro */}
        <div className="mb-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="uppercase tracking-[4px] text-xs text-[var(--pw-accent-gold)] mb-1">
                ALEPH • BETH • GIMEL
              </div>
              <h1 className="text-4xl font-semibold tracking-tighter">
                Old Testament.
                <br />
                KJV • Hebrew Interlinear • Pictographs.
              </h1>
            </div>
            <div className="text-right text-sm max-w-[280px] text-[var(--pw-text-muted)] hidden md:block">
              Full Old Testament navigation.
              <br />
              Click letters for Strong’s + pictographs.
            </div>
          </div>
        </div>

        {/* Verse navigation - full Old Testament support */}
        <div id="reader" className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="font-medium text-sm tracking-wider text-[var(--pw-text-muted)]">
              OLD TESTAMENT NAVIGATOR
            </div>
          </div>
          <VerseNavigator currentRef={currentRef} onSelect={setCurrentRef} />
        </div>

        {/* KJV first (primary) */}
        <div className="mb-6">
          <VerseDisplay verse={hasData ? displayVerse : undefined} selectedRef={selectedRef} />
          {!hasData && (
            <div className="mt-2 text-xs text-[var(--pw-text-faint)]">
              Data for {selectedRef} not available (full OT Hebrew loaded from OSHB open source).
            </div>
          )}
        </div>

        {/* Full Hebrew passage (RTL) — letters highlight graphically when you click a letter below */}
        <div className="mb-4">
          <div className="text-sm font-medium tracking-widest uppercase text-[var(--pw-text-muted)] mb-1.5">
            Hebrew Passage — click any letter to select its word (Strong’s) + pictograph
          </div>
          {hasData ? (
            <div
              className="scripture-hebrew text-[var(--pw-hebrew)] bg-[var(--pw-bg-surface)] border border-[var(--pw-border)] p-5 rounded-xl text-2xl leading-relaxed select-none"
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
              {/* preserve final punctuation if present */}
              {displayVerse.hebrew.match(/[׃]$/) && '׃'}
            </div>
          ) : (
            <div className="bg-[var(--pw-bg-surface)] border border-[var(--pw-border)] p-5 rounded-xl text-[var(--pw-text-muted)]">
              Hebrew for {selectedRef} not found in OSHB data.
            </div>
          )}
        </div>

        {/* Interlinear Hebrew + Strong's (with graphical selection) */}
        {hasData && (
          <div className="mb-8">
            <Interlinear
              words={displayVerse.words}
              selectedId={selectedInterlinearWord?.id ?? null}
              selectedLetter={selectedLetter}
              onSelect={handleSelectWord}
              onLetterClick={handleLetterClick}
            />
          </div>
        )}

        {/* Pictographic insights with graphical linkages */}
        {hasData && (
          <div id="insights" className="mb-8">
            <div className="flex items-baseline gap-3 mb-4">
              <h2 className="text-2xl font-semibold tracking-tight">Pictographic Mapping</h2>
              <div className="text-xs px-2 py-0.5 rounded bg-[var(--pw-bg-panel)] text-[var(--pw-text-muted)] border border-[var(--pw-border)]">
                {selectedRef} • {selectedInterlinearWord?.strongs}{' '}
                {selectedLetter && `• Letter: ${selectedLetter}`}
              </div>
            </div>

            <PictographBreakdown
              verse={displayVerse}
              selectedInterlinearWord={selectedInterlinearWord}
              selectedLetter={selectedLetter}
            />
          </div>
        )}

        {/* AI Summary area */}
        <div className="mb-12">
          <AISummary verse={displayVerse} />
        </div>

        {/* Datasources & Tribute to Chuck Missler */}
        <DatasourcesTribute />

        {/* Footer info */}
        <div className="text-xs text-[var(--pw-text-faint)] border-t border-[var(--pw-border)] pt-6 pb-10">
          Built with the spirit of FlowWatch — clean lib-first, deterministic core, beautiful
          reverent UI.
          <br />
          Full Old Testament navigation. Hebrew RTL. Strong’s → Blue Letter Bible + pictographs.
          <span className="ml-2 text-[var(--pw-accent-gold)]">v0.3 — Full OT Navigator</span>
        </div>
      </main>
    </div>
  );
}
