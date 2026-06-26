'use client';

import React from 'react';
import { FaqItem } from './FaqItem';

const GITHUB_REPO = 'https://github.com/brianmcconnel/paleoMem';
const GITHUB_ISSUES_URL = `${GITHUB_REPO}/issues`;
const GITHUB_NEW_ISSUE_URL = `${GITHUB_REPO}/issues/new`;
const VERSE_MAPPING_ISSUE_URL = `${GITHUB_REPO}/issues/new?title=Verse%20mapping%20issue&body=**KJV%20reference%3A**%20%0A%0A**OSHB%20shown%20(if%20any)%3A**%20%0A%0A**What%20looks%20wrong%3F**%20%0A%0A**Expected%20behavior%3A**%20%0A`;
const GENERAL_ISSUE_URL = `${GITHUB_REPO}/issues/new?title=Bug%20report&body=**What%20happened%3F**%20%0A%0A**Steps%20to%20reproduce%3A**%20%0A1.%20%0A2.%20%0A%0A**Expected%20behavior%3A**%20%0A%0A**Browser%20%2F%20device%3A**%20%0A%0A**Screenshot%20(optional)%3A**%20%0A`;

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
            paleoMem is an <span className="font-medium text-[var(--pw-text-soft)]">English-first</span>{' '}
            tool: the navigator, verse picker, and prev/next controls always use{' '}
            <span className="font-medium text-[var(--pw-text-soft)]">KJV</span> verse numbers. Hebrew
            is loaded from the <span className="font-medium text-[var(--pw-text-soft)]">OSHB</span>{' '}
            (Open Scriptures Hebrew Bible), which follows Hebrew Bible chapter and verse breaks.
          </p>
          <p>
            When KJV and OSHB disagree, paleoMem keeps the KJV reference authoritative and maps to the
            correct OSHB passage behind the scenes. The Hebrew reader explains what happened:
          </p>
          <ul className="list-disc list-inside space-y-1 text-[var(--pw-text-muted)]">
            <li>
              <span className="font-medium text-[var(--pw-text-soft)]">Verse map</span> — KJV verse
              number is shown; Hebrew is loaded from a different OSHB reference (for example, KJV
              Daniel 4:35 → OSHB Daniel 4:32).
            </li>
            <li>
              <span className="font-medium text-[var(--pw-text-soft)]">KJV only</span> — the English
              verse exists in KJV but has no OSHB Hebrew counterpart (for example, KJV Daniel 4:1–3).
            </li>
            <li>
              <span className="font-medium text-[var(--pw-text-soft)]">Numbering</span> — the verse
              label matches, but the chapter is divided differently (for example, Zechariah 1).
            </li>
          </ul>
          <p className="text-xs text-[var(--pw-text-faint)]">
            Automatic mapping covers chapter-boundary splits (Numbers 16–17, 1 Kings 4–5, Job 41–42),
            psalm superscriptions, and passages like Daniel 4, Joel 2–3, and Malachi 4.
          </p>
          <p>
            See a mapping that looks wrong? Use the{' '}
            <a
              href={VERSE_MAPPING_ISSUE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--pw-link)] hover:underline"
            >
              verse mapping report form
            </a>{' '}
            (described in <span className="font-medium text-[var(--pw-text-soft)]">How do I report a problem?</span>{' '}
            below).
          </p>
        </FaqItem>

        <FaqItem question="How do I report a problem?">
          <p>
            The best way to report a bug or request a fix is on{' '}
            <a
              href={GITHUB_ISSUES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--pw-link)] hover:underline"
            >
              GitHub Issues
            </a>{' '}
            for the paleoMem project. You will need a free GitHub account to open an issue.
          </p>

          <div>
            <div className="font-medium text-[var(--pw-text)] mb-1.5">Verse mapping problems</div>
            <p className="text-[var(--pw-text-muted)]">
              If KJV and OSHB references do not line up, or Hebrew is missing when you expect it, use
              the{' '}
              <a
                href={VERSE_MAPPING_ISSUE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--pw-link)] hover:underline"
              >
                verse mapping report form
              </a>
              . It opens a pre-filled issue — add the KJV reference, the OSHB reference shown in the
              reader (if any), and what you expected to see.
            </p>
          </div>

          <div>
            <div className="font-medium text-[var(--pw-text)] mb-1.5">Other bugs (display, PWA, Hebrew, interlinear)</div>
            <p className="text-[var(--pw-text-muted)]">
              For anything else,{' '}
              <a
                href={GENERAL_ISSUE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--pw-link)] hover:underline"
              >
                open a general bug report
              </a>
              . Helpful details include:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[var(--pw-text-muted)] mt-1.5">
              <li>What you were doing (verse reference, which panel, phone or desktop)</li>
              <li>What happened vs. what you expected</li>
              <li>Browser and device (for example, Safari on iPhone, Chrome on Android)</li>
              <li>A screenshot, if you can attach one on GitHub</li>
            </ul>
          </div>

          <p className="text-xs text-[var(--pw-text-faint)]">
            You can also browse existing issues or open a blank report from the{' '}
            <a
              href={GITHUB_NEW_ISSUE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--pw-link)] hover:underline"
            >
              new issue page
            </a>
            .
          </p>
        </FaqItem>
      </div>
    </section>
  );
}