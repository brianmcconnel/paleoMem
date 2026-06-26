'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DEFAULT_KOINE_VERSE } from '../../data/greek-nt';
import type { GreekInterlinearWord } from '../../data/greek-nt';
import { KoineHeader } from '../../components/koine/KoineHeader';
import { GreekVerseDisplay } from '../../components/koine/GreekVerseDisplay';
import { GreekReaderPanel } from '../../components/koine/GreekReaderPanel';
import { GreekInterlinear } from '../../components/koine/GreekInterlinear';
import { KoineSources } from '../../components/koine/KoineSources';

export default function KoineHydataPage() {
  const verse = DEFAULT_KOINE_VERSE;
  const [selectedWordId, setSelectedWordId] = useState<number | null>(null);

  const handleSelectWord = (word: GreekInterlinearWord) => {
    setSelectedWordId((cur) => (cur === word.id ? null : word.id));
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
            with per-word Strong&apos;s and etymology insights instead of Hebrew pictographs. Starting
            point: <span className="font-mono text-[var(--pw-accent-gold)]">John 1:1</span> — the
            thematic counterpart to Genesis 1:1.
          </p>
        </div>

        <div
          id="reader"
          className="sticky top-12 z-30 -mx-6 px-6 pt-2 pb-3 mb-3 bg-[var(--pw-bg-app)] border-b border-[var(--pw-border)] shadow-[0_8px_32px_var(--pw-shadow)] max-h-[min(55vh,560px)] overflow-y-auto"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="font-mono text-sm text-[var(--pw-accent-gold)]">{verse.ref}</div>
            <div className="text-[10px] text-[var(--pw-text-faint)] uppercase tracking-widest">
              SBLGNT · MVP
            </div>
          </div>

          <div className="mb-2">
            <GreekVerseDisplay verse={verse} />
          </div>

          <GreekReaderPanel>
            {verse.words.map((word, wi) => {
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
                  {wi < verse.words.length - 1 && ' '}
                </span>
              );
            })}
          </GreekReaderPanel>
        </div>

        <div id="insights" className="mb-8">
          <GreekInterlinear
            words={verse.words}
            selectedId={selectedWordId}
            onSelect={handleSelectWord}
          />
        </div>

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