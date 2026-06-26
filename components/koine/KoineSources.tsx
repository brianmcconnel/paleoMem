'use client';

import React from 'react';

export function KoineSources() {
  return (
    <section id="sources" className="mb-12">
      <div className="mb-4">
        <h2 className="text-xl font-semibold tracking-tight">Sources</h2>
        <p className="text-sm text-[var(--pw-text-muted)]">koineHydata text and lexicon data</p>
      </div>
      <div className="card p-4 text-sm text-[var(--pw-text-soft)] space-y-3 leading-relaxed">
        <p>
          <span className="font-medium text-[var(--pw-text)]">Greek text:</span>{' '}
          <a
            href="https://github.com/LogosBible/SBLGNT"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--pw-link)] hover:underline"
          >
            SBL Greek New Testament (SBLGNT)
          </a>{' '}
          — modern critical text (CC BY 4.0). Attribute: Society of Biblical Literature / Logos
          Bible Software.
        </p>
        <p>
          <span className="font-medium text-[var(--pw-text)]">Morphology:</span> MorphGNT-style
          lemmas and Strong&apos;s numbers align with{' '}
          <a
            href="https://github.com/morphgnt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--pw-link)] hover:underline"
          >
            MorphGNT
          </a>{' '}
          conventions where available.
        </p>
        <p>
          <span className="font-medium text-[var(--pw-text)]">Lexicon:</span>{' '}
          <a
            href="https://github.com/openscriptures/strongs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--pw-link)] hover:underline"
          >
            Open Scriptures Strong&apos;s Greek
          </a>{' '}
          (CC-BY-SA) via Blue Letter Bible links.
        </p>
        <p className="text-xs text-[var(--pw-text-faint)]">
          English column: KJV (public domain). Word insights emphasize etymology and context — not
          pictographic letter breakdowns (unlike paleoMem Hebrew).
        </p>
      </div>
    </section>
  );
}