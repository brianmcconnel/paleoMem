'use client';

import React from 'react';
import Link from 'next/link';
import { FaqItem } from '../FaqItem';

const GITHUB_REPO = 'https://github.com/brianmcconnel/paleoMem';
const GITHUB_ISSUES_URL = `${GITHUB_REPO}/issues`;
const GITHUB_NEW_ISSUE_URL = `${GITHUB_REPO}/issues/new`;
const GREEK_DATA_ISSUE_URL = `${GITHUB_REPO}/issues/new?title=Greek%20NT%20data%20issue&body=**KJV%20reference%3A**%20%0A%0A**Greek%20shown%20(if%20any)%3A**%20%0A%0A**Strong%27s%20number%20(if%20relevant)%3A**%20%0A%0A**What%20looks%20wrong%3F**%20%0A%0A**Expected%20behavior%3A**%20%0A`;
const GENERAL_ISSUE_URL = `${GITHUB_REPO}/issues/new?title=Bug%20report%20(koineHydata)&body=**Page%3A**%20%2Fkoine%0A%0A**What%20happened%3F**%20%0A%0A**Steps%20to%20reproduce%3A**%20%0A1.%20%0A2.%20%0A%0A**Expected%20behavior%3A**%20%0A%0A**Browser%20%2F%20device%3A**%20%0A%0A**Screenshot%20(optional)%3A**%20%0A`;

export function KoineFaq() {
  return (
    <section id="faq" className="mb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">FAQ</h2>
        <p className="text-sm text-[var(--pw-text-muted)]">Common questions about koineHydata</p>
      </div>

      <div className="space-y-3">
        <FaqItem question="How do I install this as an application on my phone?">
          <p>
            koineHydata is part of the same paleoMem progressive web app (PWA). Install paleoMem once
            and open <span className="font-medium text-[var(--pw-text-soft)]">/koine</span> from the
            header link or bookmark it for quick NT study — with offline reading after your first
            visit.
          </p>

          <div>
            <div className="font-medium text-[var(--pw-text)] mb-1.5">iPhone or iPad (Safari)</div>
            <ol className="list-decimal list-inside space-y-1 text-[var(--pw-text-muted)]">
              <li>
                Open{' '}
                <span className="text-[var(--pw-text-soft)]">paleoMem in Safari</span> (the built-in
                browser).
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
                the app and tap <span className="font-medium text-[var(--pw-accent)]">koineHydata</span>{' '}
                in the header.
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
              <li>
                Open the installed app and navigate to{' '}
                <span className="font-medium text-[var(--pw-accent)]">koineHydata</span>.
              </li>
            </ol>
          </div>

          <p className="text-xs text-[var(--pw-text-faint)]">
            After installing, the app opens in its own window without the browser toolbar. When a
            newer version is available, you will be prompted to refresh.
          </p>
        </FaqItem>

        <FaqItem question="How is koineHydata different from paleoMem?">
          <p>
            <Link href="/" className="text-[var(--pw-link)] hover:underline font-medium">
              paleoMem
            </Link>{' '}
            covers the <span className="font-medium text-[var(--pw-text-soft)]">Old Testament</span>:
            KJV beside pointed Hebrew (OSHB), with Paleo-Hebrew pictograph cards for each letter.
          </p>
          <p>
            <span className="font-medium text-[var(--pw-text)]">koineHydata</span> covers the{' '}
            <span className="font-medium text-[var(--pw-text-soft)]">New Testament</span>: KJV beside{' '}
            <span className="font-medium text-[var(--pw-accent)]">SBLGNT Greek</span>, with per-word
            Strong&apos;s numbers and etymology insights — not pictographic letter breakdowns.
          </p>
          <p className="text-xs text-[var(--pw-text-faint)]">
            Both sections share the same PWA, theme toggle, and KJV navigator pattern; only the study
            layer differs (Hebrew letters vs. Greek words).
          </p>
        </FaqItem>

        <FaqItem question="What Greek and English texts does koineHydata use?">
          <p>
            English is always the public-domain{' '}
            <span className="font-medium text-[var(--pw-text-soft)]">King James Version (KJV)</span>.
            The navigator and verse picker use KJV chapter and verse numbers for all 27 NT books.
          </p>
          <p>
            Greek comes from the{' '}
            <span className="font-medium text-[var(--pw-accent)]">SBL Greek New Testament (SBLGNT)</span>{' '}
            via the open{' '}
            <a
              href="https://github.com/morphgnt/sblgnt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--pw-link)] hover:underline"
            >
              MorphGNT SBLGNT Edition
            </a>
            , with morphological lemmas and parsing (CC BY-SA 3.0). See{' '}
            <a href="#sources" className="text-[var(--pw-link)] hover:underline">
              Sources
            </a>{' '}
            for full attribution.
          </p>
        </FaqItem>

        <FaqItem question="Why are there no pictograph letter cards for Greek?">
          <p>
            Paleo-Hebrew pictographs study the ancient picture-sense behind Hebrew letters — a method
            paleoMem applies to the OT. The New Testament was written in{' '}
            <span className="font-medium text-[var(--pw-text-soft)]">Koine Greek</span>, not Hebrew
            script, and koineHydata follows a word-based study path instead: roots, usage in context,
            and Strong&apos;s definitions.
          </p>
          <p>
            Click any Greek word for a{' '}
            <span className="font-medium text-[var(--pw-text-soft)]">word insight</span> card
            (etymology and theological context where curated). This is intentional — Greek letter
            pictographs are not the focus of this NT reader.
          </p>
        </FaqItem>

        <FaqItem question="Why are some Strong's numbers missing?">
          <p>
            Strong&apos;s codes are mapped automatically from MorphGNT lemmas to the{' '}
            <a
              href="https://github.com/openscriptures/strongs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--pw-link)] hover:underline"
            >
              Open Scriptures Greek dictionary
            </a>
            . When a lemma does not match cleanly, the interlinear card may show Greek and gloss
            without a Strong&apos;s link.
          </p>
          <p className="text-xs text-[var(--pw-text-faint)]">
            Proper names, particles, and rare forms account for most gaps. You can still read the
            Greek word and KJV English; report persistent mapping gaps using the form below.
          </p>
        </FaqItem>

        <FaqItem question="Why do word insights vary from verse to verse?">
          <p>
            Every Greek word shows a Strong&apos;s card with gloss and transliteration when mapped.
            The <span className="font-medium text-[var(--pw-text-soft)]">insight panel</span> adds
            curated etymology and context for key words — John 1:1 is fully annotated (for example
            λόγος, ἀρχή, θεός).
          </p>
          <p>
            Words without a curated note still show a fallback insight from the Strong&apos;s entry
            (derivation and definition). Grammatical words like the article (ὁ) and conjunctions (καί)
            receive shorter, grammar-focused notes.
          </p>
        </FaqItem>

        <FaqItem question="How do I report a problem?">
          <p>
            Report bugs on{' '}
            <a
              href={GITHUB_ISSUES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--pw-link)] hover:underline"
            >
              GitHub Issues
            </a>{' '}
            for the paleoMem project. You need a free GitHub account to open an issue.
          </p>

          <div>
            <div className="font-medium text-[var(--pw-text)] mb-1.5">Greek text or Strong&apos;s mapping</div>
            <p className="text-[var(--pw-text-muted)]">
              Missing Greek for a verse, wrong word order, or a Strong&apos;s number that should map?
              Use the{' '}
              <a
                href={GREEK_DATA_ISSUE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--pw-link)] hover:underline"
              >
                Greek NT data report form
              </a>
              . Include the KJV reference, what Greek appeared (if any), and what you expected.
            </p>
          </div>

          <div>
            <div className="font-medium text-[var(--pw-text)] mb-1.5">
              Other bugs (display, PWA, navigator, insights)
            </div>
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
              <li>NT verse reference and which panel (reader, interlinear, insight)</li>
              <li>What happened vs. what you expected</li>
              <li>Browser and device (for example, Safari on iPhone, Chrome on Android)</li>
              <li>A screenshot, if you can attach one on GitHub</li>
            </ul>
          </div>

          <p className="text-xs text-[var(--pw-text-faint)]">
            OT verse-mapping issues belong on paleoMem&apos;s{' '}
            <Link href="/#faq" className="text-[var(--pw-link)] hover:underline">
              FAQ report form
            </Link>
            . You can also browse existing issues from the{' '}
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