'use client';

import React, { useMemo } from 'react';
import { getCrossRefVerseText } from '../../lib/cross-ref-verse-text';
import { getKjvJesusMask } from '../../lib/red-letter';
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
    <p className="scripture-english text-[1.05rem] leading-relaxed text-[var(--pw-english)]">
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
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--pw-vav-accent)]">
        Selected verses
      </h2>
      <div className="space-y-3">
        {entries.map(({ ref, text }, index) => {
          const color = accentColor(ref);
          const isSelected = ref === selectedRef;
          const isNewest = index === 0;

          return (
            <article
              key={`${ref}-${index}`}
              className={`card p-4 transition-colors ${
                isSelected || isNewest ? 'ring-1' : 'opacity-90'
              }`}
              style={
                isSelected || isNewest
                  ? { borderColor: color, boxShadow: `0 0 0 1px color-mix(in srgb, ${color} 35%, transparent)` }
                  : undefined
              }
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => onSelectRef?.(ref)}
                  className="text-left min-w-0 flex-1"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-sm font-semibold" style={{ color }}>
                      {ref}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-[var(--pw-text-faint)] shrink-0">
                      KJV · {text.originalKind}
                    </span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveRef?.(ref)}
                  className="shrink-0 text-[var(--pw-text-faint)] hover:text-[var(--pw-text)] text-sm leading-none opacity-50 hover:opacity-100 px-1"
                  aria-label={`Remove ${ref}`}
                >
                  ×
                </button>
              </div>
              <button
                type="button"
                onClick={() => onSelectRef?.(ref)}
                className="text-left w-full space-y-3"
              >

                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[var(--pw-text-faint)] mb-1">
                    King James Version
                  </div>
                  {text.testament === 'nt' ? (
                    <NtKjvText ref={ref} />
                  ) : (
                    <p className="scripture-english text-[1.05rem] leading-relaxed text-[var(--pw-english)]">
                      {text.kjv}
                    </p>
                  )}
                </div>

                <div>
                  <div
                    className="text-[10px] uppercase tracking-widest mb-1"
                    style={{ color }}
                  >
                    {text.originalKind}
                  </div>
                  {text.missingOriginal ? (
                    <p className="text-sm text-[var(--pw-text-muted)]">
                      {text.originalKind} text not loaded for this reference.
                    </p>
                  ) : text.testament === 'ot' ? (
                    <p
                      className="scripture-hebrew text-xl leading-relaxed text-[var(--pw-hebrew)]"
                      dir="rtl"
                    >
                      {text.original}
                    </p>
                  ) : (
                    <p
                      className="scripture-greek text-xl leading-relaxed text-[var(--pw-greek)]"
                      dir="ltr"
                    >
                      {text.original}
                    </p>
                  )}
                </div>
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}