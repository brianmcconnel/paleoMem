'use client';

import React from 'react';

function FaqItem({ question, children }: { question: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-lg border border-[var(--pw-border)] bg-[var(--pw-bg-elevated)]/40 open:bg-[var(--pw-bg-elevated)]/70 transition-colors">
      <summary className="cursor-pointer list-none px-4 py-3.5 flex items-start justify-between gap-3 text-sm font-medium text-[var(--pw-text)] marker:content-none [&::-webkit-details-marker]:hidden">
        <span>{question}</span>
        <span
          className="shrink-0 text-[var(--pw-text-muted)] group-open:rotate-180 transition-transform"
          aria-hidden
        >
          ▾
        </span>
      </summary>
      <div className="px-4 pb-4 text-sm text-[var(--pw-text-soft)] leading-relaxed space-y-3 border-t border-[var(--pw-border)]/60 pt-3">
        {children}
      </div>
    </details>
  );
}

export function Faq() {
  return (
    <section id="faq" className="mb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">FAQ</h2>
        <p className="text-sm text-[var(--pw-text-muted)]">Common questions about paleoMem</p>
      </div>

      <div className="space-y-3">
        <FaqItem question="How do I install this as an application on my phone?">
          <p>
            paleoMem is a progressive web app (PWA). You can add it to your home screen and open it
            like a native app — with quick access and offline reading after your first visit.
          </p>

          <div>
            <div className="font-medium text-[var(--pw-text)] mb-1.5">iPhone or iPad (Safari)</div>
            <ol className="list-decimal list-inside space-y-1 text-[var(--pw-text-muted)]">
              <li>
                Open{' '}
                <span className="text-[var(--pw-text-soft)]">
                  paleoMem in Safari
                </span>{' '}
                (the built-in browser).
              </li>
              <li>
                Tap the <span className="font-medium text-[var(--pw-text-soft)]">Share</span> button
                (square with an arrow pointing up).
              </li>
              <li>
                Scroll the share sheet and tap{' '}
                <span className="font-medium text-[var(--pw-text-soft)]">Add to Home Screen</span>.
              </li>
              <li>
                Tap <span className="font-medium text-[var(--pw-text-soft)]">Add</span>, then launch
                paleoMem from your home screen.
              </li>
            </ol>
          </div>

          <div>
            <div className="font-medium text-[var(--pw-text)] mb-1.5">Android (Chrome)</div>
            <ol className="list-decimal list-inside space-y-1 text-[var(--pw-text-muted)]">
              <li>
                Open paleoMem in <span className="font-medium text-[var(--pw-text-soft)]">Chrome</span>.
              </li>
              <li>
                On a return visit, you may see an{' '}
                <span className="font-medium text-[var(--pw-text-soft)]">Install paleoMem</span> banner
                at the top — tap <span className="font-medium text-[var(--pw-text-soft)]">Install</span>.
              </li>
              <li>
                If you do not see the banner, open the menu (
                <span className="font-medium text-[var(--pw-text-soft)]">⋮</span>) and choose{' '}
                <span className="font-medium text-[var(--pw-text-soft)]">Install app</span> or{' '}
                <span className="font-medium text-[var(--pw-text-soft)]">Add to Home screen</span>.
              </li>
              <li>Confirm, then open paleoMem from your app drawer or home screen.</li>
            </ol>
          </div>

          <p className="text-xs text-[var(--pw-text-faint)]">
            After installing, paleoMem opens in its own window without the browser toolbar. When a
            newer version is available, you will be prompted to refresh so you always have the latest
            fixes and features.
          </p>
        </FaqItem>

        <FaqItem question="Why do some KJV verses show a verse-numbering warning?">
          <p>
            paleoMem navigates by <span className="font-medium text-[var(--pw-text-soft)]">KJV</span>{' '}
            verse numbers (familiar from English Bibles) but loads Hebrew from the{' '}
            <span className="font-medium text-[var(--pw-text-soft)]">OSHB</span> (Open Scriptures
            Hebrew Bible), which follows Hebrew Bible chapter and verse breaks.
          </p>
          <p>
            In a few places those systems disagree. When they do, the Hebrew reader shows a notice:
          </p>
          <ul className="list-disc list-inside space-y-1 text-[var(--pw-text-muted)]">
            <li>
              <span className="font-medium text-[var(--pw-text-soft)]">Verse map</span> — we load
              Hebrew from a different OSHB reference (for example, KJV Daniel 4:35 → OSHB Daniel
              4:32).
            </li>
            <li>
              <span className="font-medium text-[var(--pw-text-soft)]">KJV only</span> — the KJV
              verse has no OSHB counterpart (for example, KJV Daniel 4:1–3).
            </li>
            <li>
              <span className="font-medium text-[var(--pw-text-soft)]">Numbering</span> — the verse
              label matches, but KJV and OSHB split the chapter differently (for example, Exodus 8 or
              many Psalms superscriptions).
            </li>
          </ul>
          <p className="text-xs text-[var(--pw-text-faint)]">
            Mapped passages include Daniel 4, Daniel 5:31, Genesis 31:55, Joel 2:28–32, Joel 3, and
            Malachi 4. Other known divergence chapters show a numbering notice without automatic
            remapping.
          </p>
        </FaqItem>
      </div>
    </section>
  );
}