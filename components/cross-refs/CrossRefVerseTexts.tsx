'use client';

import { useRouter } from 'next/navigation';
import React, { useMemo } from 'react';
import { getCrossRefVerseText } from '../../lib/cross-ref-verse-text';
import { getKjvJesusMask } from '../../lib/red-letter';
import { navigateToScriptureViewer, scriptureViewerForRef } from '../../lib/scripture-viewer-nav';
import { refToVid, verseAccentColor } from '../../lib/verse-id';
import { getGreekVerse } from '../../data/greek-nt';

interface CrossRefVerseTextsProps {
  refs: string[];
  selectedRef: string;
  onSelectRef?: (ref: string) => void;
  onRemoveRef?: (ref: string) => void;
}

function accentColor(ref: string): string {
  const vid = refToVid(ref);
  if (vid == null) return 'var(--pw-text)';
  return verseAccentColor(vid) === 'gold' ? 'var(--pw-accent-gold)' : 'var(--pw-accent)';
}

function NtKjvText({ ref }: { ref: string }) {
  const verse = getGreekVerse(ref);
  if (!verse) return null;

  const parts = useMemo(() => {
    const tokens = verse.kjv.match(/\S+|\s+/g) ?? [verse.kjv];
    const wordMask = getKjvJesusMask(verse);
    let wordIndex = 0;

    return tokens.map((token, index) => {
      const isWord = /\S/.test(token);
      const isJesus = isWord ? wordMask[wordIndex++] === true : false;
      return { key: index, token, isJesus };
    });
  }, [verse]);

  return (
    <p className="scripture-english text-sm leading-relaxed text-[var(--pw-english)]">
      {parts.map((part) =>
        part.isJesus ? (
          <span key={part.key} className="text-[var(--pw-jesus)] font-medium">
            {part.token}
          </span>
        ) : (
          <span key={part.key}>{part.token}</span>
        ),
      )}
    </p>
  );
}

export function CrossRefVerseTexts({ refs, selectedRef, onSelectRef, onRemoveRef }: CrossRefVerseTextsProps) {
  const router = useRouter();

  const entries = useMemo(
    () =>
      refs
        .map((ref) => ({ ref, text: getCrossRefVerseText(ref) }))
        .filter((row): row is { ref: string; text: NonNullable<ReturnType<typeof getCrossRefVerseText>> } =>
          row.text != null,
        ),
    [refs],
  );

  if (!entries.length) return null;

  return (
    <section className="border-t border-[var(--pw-border)] pt-4">
      <p className="text-[10px] text-[var(--pw-text-faint)] mb-2">Selected verses</p>
      <ul className="divide-y divide-[var(--pw-border)]">
        {entries.map(({ ref, text }, index) => {
          const color = accentColor(ref);
          const isCurrent = ref === selectedRef || index === 0;
          const viewer = scriptureViewerForRef(ref);

          return (
            <li
              key={`${ref}-${index}`}
              className={`py-3 first:pt-0 last:pb-0 border-l-2 pl-3 ${isCurrent ? '' : 'opacity-75'}`}
              style={{ borderColor: isCurrent ? color : 'transparent' }}
            >
              <div className="flex items-center gap-2 mb-1.5 min-w-0">
                <button
                  type="button"
                  onClick={() => navigateToScriptureViewer(ref, router.push)}
                  disabled={viewer == null}
                  className="font-mono text-xs font-medium hover:underline underline-offset-2 truncate disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ color }}
                  aria-label={
                    viewer ? `Open ${ref} in ${viewer.app}` : `Cannot open ${ref} in scripture viewer`
                  }
                >
                  {ref}
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveRef?.(ref)}
                  className="shrink-0 text-[var(--pw-text-faint)] hover:text-[var(--pw-text)] text-xs leading-none ml-auto"
                  aria-label={`Remove ${ref}`}
                >
                  ×
                </button>
              </div>
              <button
                type="button"
                onClick={() => onSelectRef?.(ref)}
                className="text-left w-full space-y-1.5 hover:opacity-90 transition-opacity"
              >
                {text.testament === 'nt' ? (
                  <NtKjvText ref={ref} />
                ) : (
                  <p className="scripture-english text-sm leading-relaxed text-[var(--pw-english)]">
                    {text.kjv}
                  </p>
                )}
                {text.missingOriginal ? (
                  <p className="text-xs text-[var(--pw-text-faint)]">{text.originalKind} unavailable</p>
                ) : text.testament === 'ot' ? (
                  <p
                    className="scripture-hebrew text-base leading-relaxed text-[var(--pw-hebrew)]"
                    dir="rtl"
                  >
                    {text.original}
                  </p>
                ) : (
                  <p
                    className="scripture-greek text-base leading-relaxed text-[var(--pw-greek)]"
                    dir="ltr"
                  >
                    {text.original}
                  </p>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}