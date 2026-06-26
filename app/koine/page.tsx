'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  DEFAULT_KOINE_VERSE,
  getGreekVerse,
} from '../../data/greek-nt';
import type { GreekInterlinearWord } from '../../data/greek-nt';
import { normalizeNtReference } from '../../data/nt-books';
import { KoineHeader } from '../../components/koine/KoineHeader';
import { NtVerseNavigator } from '../../components/koine/NtVerseNavigator';
import { GreekVerseDisplay } from '../../components/koine/GreekVerseDisplay';
import { GreekReaderPanel } from '../../components/koine/GreekReaderPanel';
import { GreekInterlinear } from '../../components/koine/GreekInterlinear';
import { KoineSources } from '../../components/koine/KoineSources';
import { getLastKoineVerse, setLastKoineVerse } from '../../lib/koine-cookies';

export default function KoineHydataPage() {
  const [currentRef, setCurrentRef] = useState<string>(DEFAULT_KOINE_VERSE.ref);
  const [verseReady, setVerseReady] = useState(false);
  const [selectedWordId, setSelectedWordId] = useState<number | null>(null);

  useEffect(() => {
    const saved = getLastKoineVerse();
    if (saved) {
      const normalized = normalizeNtReference(saved);
      if (getGreekVerse(normalized)) {
        setCurrentRef(normalized);
      }
    }
    setVerseReady(true);
  }, []);

  useEffect(() => {
    if (!verseReady) return;
    setLastKoineVerse(currentRef);
  }, [currentRef, verseReady]);

  const verseData = getGreekVerse(currentRef);
  const hasData = !!verseData;
  const hasGreekWords = (verseData?.words.length ?? 0) > 0;
  const displayVerse = verseData ?? DEFAULT_KOINE_VERSE;
  const selectedWord = useMemo(
    () => displayVerse.words.find((w) => w.id === selectedWordId) ?? null,
    [displayVerse.words, selectedWordId],
  );

  const handleRefChange = (ref: string) => {
    setCurrentRef(ref);
    setSelectedWordId(null);
  };

  const handleSelectWord = (word: GreekInterlinearWord) => {
    setSelectedWordId(word.id);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <KoineHeader />

      <main className="flex-1 max-w-6xl mx-auto px-6 py-4 sm:py-5 w-full">
        <div className="mb-4 rounded-xl border border-[var(--pw-border)] bg-[var(--pw-bg-elevated)]/40 px-4 py-3 text-sm text-[var(--pw-text-soft)] leading-relaxed">
          <p>
            <span className="font-medium text-[var(--pw-text)]">koineHydata</span> parallels{' '}
            <Link href="/" className="text-[var(--pw-link)] hover:underline">
              paleoMem
            </Link>{' '}
            for the New Testament: KJV English beside{' '}
            <span className="font-medium text-[var(--pw-text-soft)]">Koine Greek</span> (SBLGNT),
            with per-word Strong&apos;s and etymology insights. Click any Greek word for its insight.
          </p>
        </div>

        <div
          id="reader"
          className="sticky top-12 z-30 -mx-6 px-6 pt-2 pb-3 mb-3 bg-[var(--pw-bg-app)] border-b border-[var(--pw-border)] shadow-[0_8px_32px_var(--pw-shadow)] max-h-[min(55vh,560px)] overflow-y-auto"
        >
          <div className="mb-2">
            <NtVerseNavigator currentRef={currentRef} onSelect={handleRefChange} />
          </div>

          <div className="mb-2">
            {hasData ? (
              <GreekVerseDisplay verse={displayVerse} />
            ) : (
              <div className="card p-3 text-sm text-[var(--pw-text-muted)]">
                No text for{' '}
                <span className="font-mono text-[var(--pw-accent-gold)]">{currentRef}</span>
              </div>
            )}
          </div>

          <div>
            {hasGreekWords ? (
              <GreekReaderPanel selectedWord={selectedWord}>
                {displayVerse.words.map((word, wi) => {
                  const isSelected = selectedWordId === word.id;
                  return (
                    <span key={word.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectWord(word)}
                        className={`inline scripture-greek text-inherit bg-transparent border-0 p-0 cursor-pointer rounded-sm ${
                          isSelected
                            ? 'word-in-passage bg-[var(--pw-accent)]/25 ring-1 ring-[var(--pw-accent)]/50'
                            : 'hover:bg-[var(--pw-accent)]/10'
                        }`}
                      >
                        {word.greek}
                      </button>
                      {wi < displayVerse.words.length - 1 && ' '}
                    </span>
                  );
                })}
              </GreekReaderPanel>
            ) : (
              <div className="bg-[var(--pw-bg-surface)] border border-[var(--pw-border)] p-4 rounded-xl text-[var(--pw-text-muted)] text-sm">
                {hasData
                  ? `No Greek interlinear available for ${currentRef} — KJV English is shown above.`
                  : `Greek for ${currentRef} not found.`}
              </div>
            )}
          </div>
        </div>

        {hasGreekWords && (
          <div id="insights" className="mb-8">
            <GreekInterlinear
              words={displayVerse.words}
              selectedId={selectedWordId}
              onSelect={handleSelectWord}
            />
          </div>
        )}

        <KoineSources />

        <div className="text-xs text-[var(--pw-text-faint)] border-t border-[var(--pw-border)] pt-6 pb-10">
          © 2026 Brian McConnel · koineHydata (NT) ·{' '}
          <Link href="/" className="text-[var(--pw-link)] hover:underline">
            paleoMem (OT)
          </Link>
        </div>
      </main>
    </div>
  );
}