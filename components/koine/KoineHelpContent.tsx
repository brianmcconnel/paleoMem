'use client';

import React from 'react';
import Link from 'next/link';
import { KoineHelpInterlinearExample } from './KoineHelpInterlinearExample';

export function KoineHelpContent() {
  return (
    <div className="space-y-5 text-sm leading-relaxed text-[var(--pw-text-soft)]">
      <p>
        <span className="font-medium text-[var(--pw-text)]">koineHydata</span> is a scripture study
        reader for the New Testament. It places King James English beside{' '}
        <span className="font-medium text-[var(--pw-greek)]">SBLGNT Greek</span>, Strong&apos;s
        numbers, and per-word etymology insights — not pictographic letter breakdowns.
      </p>

      <p className="text-xs text-[var(--pw-text-faint)] border-l-2 border-[var(--pw-accent)] pl-3 leading-relaxed">
        For the Old Testament with Hebrew interlinear and Paleo-Hebrew pictographs, use{' '}
        <Link href="/" className="text-[var(--pw-link)] hover:underline font-medium">
          paleoMem
        </Link>
        .
      </p>

      <div>
        <div className="text-xs font-semibold uppercase tracking-widest text-[var(--pw-accent)] mb-2">
          How to use
        </div>
        <ol className="space-y-2 list-decimal list-inside text-[var(--pw-text-muted)]">
          <li>
            <span className="text-[var(--pw-text-soft)]">
              Pick any NT verse with the navigator (book, chapter, verse, prev/next).
            </span>
          </li>
          <li>
            <span className="text-[var(--pw-text-soft)]">
              Read <span className="text-[var(--pw-accent-gold)]">KJV</span> and{' '}
              <span className="text-[var(--pw-accent)]">SBLGNT</span> together in the reader. Greek
              reads left to right — click any Greek word for its insight card.
            </span>
          </li>
          <li>
            <span className="text-[var(--pw-text-soft)]">
              Scroll to <strong className="font-medium text-[var(--pw-text)]">Interlinear</strong>{' '}
              rows — each word has a Strong&apos;s card plus a word insight when available. Click a
              Strong&apos;s number to open Blue Letter Bible.
            </span>
          </li>
        </ol>
      </div>

      <KoineHelpInterlinearExample />

      <div>
        <div className="text-xs font-semibold uppercase tracking-widest text-[var(--pw-accent)] mb-2">
          The method
        </div>
        <p>
          koineHydata studies Koine Greek words in their NT context — roots, usage, and theological
          sense (for example λόγος in John 1:1). Unlike paleoMem&apos;s Hebrew pictographs, Greek
          insights emphasize etymology and narrative context rather than per-letter emoji chains.
        </p>
        <p className="mt-2 text-xs text-[var(--pw-text-faint)]">
          Word insights are a study layer meant to deepen meditation, not replace grammar or
          lexicons. Always anchor insight in the plain reading of Scripture.
        </p>
      </div>
    </div>
  );
}