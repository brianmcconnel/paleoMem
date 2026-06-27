'use client';

import Link from 'next/link';
import React from 'react';
import { VAV_MAX_SELECTION } from '../../lib/vav-state';

export function VavHelpContent() {
  return (
    <div className="space-y-5 text-sm leading-relaxed text-[var(--pw-text-soft)]">
      <p>
        <span className="font-medium text-[var(--pw-text)]">Vav</span>{' '}
        <span className="scripture-hebrew text-[var(--pw-vav-accent)]" title="Vav — hook, peg, and">
          ו
        </span>{' '}
        explores Treasury of Scripture Knowledge cross-references across the whole Bible — the letter
        that hooks and joins. Gold nodes are Old Testament, blue are New Testament.
      </p>

      <p className="text-xs text-[var(--pw-text-faint)] border-l-2 border-[var(--pw-vav-accent)] pl-3 leading-relaxed">
        Cross-reference data from{' '}
        <a
          href="https://a.openbible.info/data/cross-references.zip"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--pw-link)] hover:underline font-medium"
        >
          OpenBible.info
        </a>{' '}
        (CC BY 4.0). For verse text, use{' '}
        <Link href="/" className="text-[var(--pw-link)] hover:underline font-medium">
          paleoMem
        </Link>{' '}
        (OT) or{' '}
        <Link href="/koine" className="text-[var(--pw-link)] hover:underline font-medium">
          koineHydata
        </Link>{' '}
        (NT).
      </p>

      <div className="rounded-lg border border-[var(--pw-border)] bg-[var(--pw-bg-elevated)]/50 px-3 py-2.5 space-y-2">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--pw-vav-accent)]">
          Graph legend
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[var(--pw-text-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[var(--pw-accent-gold)] shrink-0" />
            OT verse
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[var(--pw-accent)] shrink-0" />
            NT verse
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[var(--pw-success)] shrink-0" />
            Book hub
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: 'rgb(167, 139, 250)' }}
            />
            Chapter hub
          </span>
        </div>
        <p className="text-xs text-[var(--pw-text-faint)]">
          The center verse&apos;s book sits at the middle; its chapters ring around it; linked verses
          spread outward. Books with more cross-references sit on an inner ring.
        </p>
      </div>

      <div>
        <div className="text-xs font-semibold uppercase tracking-widest text-[var(--pw-vav-accent)] mb-2">
          How to use
        </div>
        <ol className="space-y-2 list-decimal list-inside text-[var(--pw-text-muted)]">
          <li>
            <span className="text-[var(--pw-text-soft)]">
              Pick a starting verse with the navigator (OT or NT, book/chapter/verse, prev/next).
            </span>
          </li>
          <li>
            <span className="text-[var(--pw-text-soft)]">
              Adjust <strong className="font-medium text-[var(--pw-text)]">Votes</strong> to hide
              weaker links, and <strong className="font-medium text-[var(--pw-text)]">Layers</strong>{' '}
              to expand one or more hops from the center verse.
            </span>
          </li>
          <li>
            <span className="text-[var(--pw-text-soft)]">
              Hover or tap a verse node for KJV text in the tooltip. Click a verse to center the graph
              on it and add it to your selection.
            </span>
          </li>
          <li>
            <span className="text-[var(--pw-text-soft)]">
              Scroll to zoom, drag the canvas to pan, and drag a book hub to reposition it (desktop).
              On mobile, pinch to zoom and tap verses to select.
            </span>
          </li>
          <li>
            <span className="text-[var(--pw-text-soft)]">
              Below the graph, <strong className="font-medium text-[var(--pw-text)]">Selected verses</strong>{' '}
              shows KJV plus Hebrew or Greek. Click a reference to open that verse in paleoMem or
              koineHydata; click the verse text to re-center the graph.
            </span>
          </li>
        </ol>
      </div>

      <div>
        <div className="text-xs font-semibold uppercase tracking-widest text-[var(--pw-vav-accent)] mb-2">
          Your session
        </div>
        <p>
          Vav remembers your center verse, up to {VAV_MAX_SELECTION} selected verses, min votes, and
          link layers in this browser — they restore the next time you visit.
        </p>
        <p className="mt-2 text-xs text-[var(--pw-text-faint)]">
          Use <strong className="font-medium text-[var(--pw-text-soft)]">Reset</strong> to clear
          selected verses and return to Genesis 1:1.
        </p>
      </div>
    </div>
  );
}