'use client';

import React from 'react';
import { GREEK_NT_SOURCE_ATTRIBUTION, isGreekNtDataLoaded } from '../../data/greek-nt';

export function KoineSources() {
  const loaded = isGreekNtDataLoaded();

  return (
    <section id="sources" className="mb-12">
      <div className="mb-4">
        <h2 className="text-xl font-semibold tracking-tight">Sources &amp; Attribution</h2>
        <p className="text-sm text-[var(--pw-text-muted)]">koineHydata text and lexicon data</p>
      </div>
      <div className="card p-4 text-sm text-[var(--pw-text-soft)] space-y-4 leading-relaxed">
        <div>
          <div className="font-medium text-[var(--pw-text)]">Greek text + morphology</div>
          <div>
            <a
              href="https://github.com/morphgnt/sblgnt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--pw-link)] hover:underline"
            >
              MorphGNT: SBLGNT Edition
            </a>{' '}
            (v6.12) —{' '}
            <a
              href="https://doi.org/10.5281/zenodo.376200"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--pw-link)] hover:underline"
            >
              DOI 10.5281/zenodo.376200
            </a>
          </div>
          <div className="text-[10px] text-[var(--pw-text-faint)] mt-1">
            {GREEK_NT_SOURCE_ATTRIBUTION}. Greek text from the{' '}
            <a
              href="https://sblgnt.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--pw-link)] hover:underline"
            >
              SBL Greek New Testament (SBLGNT)
            </a>{' '}
            — Society of Biblical Literature / Logos Bible Software (see{' '}
            <a
              href="https://github.com/LogosBible/SBLGNT"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--pw-link)] hover:underline"
            >
              LogosBible/SBLGNT
            </a>{' '}
            for license terms). Morphological parsing and lemmatization:{' '}
            <a
              href="https://creativecommons.org/licenses/by-sa/3.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--pw-link)] hover:underline"
            >
              CC BY-SA 3.0
            </a>
            .
          </div>
        </div>

        <div>
          <div className="font-medium text-[var(--pw-text)]">Strong&apos;s numbers</div>
          <div>
            Mapped from{' '}
            <a
              href="https://github.com/openscriptures/strongs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--pw-link)] hover:underline"
            >
              Open Scriptures Strong&apos;s Greek
            </a>{' '}
            (
            <a
              href="https://creativecommons.org/licenses/by-sa/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--pw-link)] hover:underline"
            >
              CC BY-SA
            </a>
            ). Glosses and transliterations follow the dictionary; some lemmas may lack a mapping.
          </div>
          <div className="text-[10px] text-[var(--pw-text-faint)] mt-1">
            Full Strong&apos;s entries:{' '}
            <a
              href="https://www.blueletterbible.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--pw-link)] hover:underline"
            >
              Blue Letter Bible
            </a>
            .
          </div>
        </div>

        <div>
          <div className="font-medium text-[var(--pw-text)]">English (KJV)</div>
          <div>
            Public-domain King James Version from open Bible repositories (e.g. bibleapi-bibles-json).
          </div>
        </div>

        <div>
          <div className="font-medium text-[var(--pw-text)]">Red letter (words of Jesus)</div>
          <div>
            Jesus&apos;s direct speech is shown in{' '}
            <span className="text-[var(--pw-jesus)] font-medium">red</span> (KJV and Greek), using{' '}
            <a
              href="https://berean.bible/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--pw-link)] hover:underline"
            >
              Berean Standard Bible
            </a>{' '}
            USFM <span className="font-mono text-[var(--pw-text-muted)]">\wj</span> markers (public
            domain), aligned proportionally to each verse&apos;s word list.
          </div>
        </div>

        <div>
          <div className="font-medium text-[var(--pw-text)]">Word insights</div>
          <div>
            Curated etymology and context notes — not pictographic letter breakdowns (unlike paleoMem
            Hebrew). Insights are a study aid, not a lexicon.
          </div>
        </div>

        <div className="text-[10px] text-[var(--pw-text-faint)] border-t border-[var(--pw-border)] pt-3">
          {loaded
            ? 'Full New Testament Greek interlinear loaded from MorphGNT SBLGNT Edition.'
            : 'Greek data not loaded — run npm run data:fetch:greek to generate data/nt-greek.json.'}{' '}
          This app is a study tool, not an authoritative translation.
        </div>
      </div>
    </section>
  );
}