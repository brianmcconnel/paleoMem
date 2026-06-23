'use client';

import React, { useState } from 'react';
import { LetterGrid } from './LetterGrid';
import { parseWord, ParsedWord, getBlueLetterBibleUrl } from '../lib/pictograph';
import { InterlinearWord, ScriptureVerse } from '../data/verses';
import { ExternalLink } from 'lucide-react';
import { getStrongs } from '../lib/strongs';

interface PictographBreakdownProps {
  verse: ScriptureVerse;
  selectedInterlinearWord: InterlinearWord | null;
  selectedLetter: string | null;
}

export function PictographBreakdown({
  verse,
  selectedInterlinearWord,
  selectedLetter,
}: PictographBreakdownProps) {
  const [showEmojis, setShowEmojis] = useState(true);

  // Parse the selected interlinear word's Hebrew for pictographs
  const selectedParsed: ParsedWord | null = React.useMemo(() => {
    if (!selectedInterlinearWord) return null;
    return parseWord(selectedInterlinearWord.hebrew);
  }, [selectedInterlinearWord]);

  const defaultParsed = React.useMemo(() => {
    const first = verse.words[0];
    return first ? parseWord(first.hebrew) : null;
  }, [verse.words]);

  const activeParsed = selectedParsed ?? defaultParsed;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-lg tracking-tight">Pictographic Breakdown</div>
          <div className="text-sm text-[var(--pw-text-muted)]">
            Letter-by-letter Paleo-Hebrew meanings linked to Strong’s
          </div>
        </div>

        <label className="toggle text-sm">
          <input
            type="checkbox"
            checked={showEmojis}
            onChange={e => setShowEmojis(e.target.checked)}
          />
          <span>Show emojis</span>
        </label>
      </div>

      {activeParsed && (
        <div className="pt-2 border-t border-[var(--pw-border)]">
          <LetterGrid word={activeParsed} showEmojis={showEmojis} selectedLetter={selectedLetter} />
        </div>
      )}

      {selectedInterlinearWord && (() => {
        const entry = getStrongs(selectedInterlinearWord.strongs);
        const desc = entry?.strongs_def || entry?.kjv_def;
        return (
          <div className="mt-4 pt-4 border-t border-[var(--pw-border)]">
            <div className="text-xs uppercase tracking-widest text-[var(--pw-text-muted)] mb-2">
              Selected Word
            </div>

            {/* Hebrew word + gloss */}
            <div className="flex items-baseline gap-3 flex-wrap mb-2">
              <div className="scripture-hebrew text-3xl text-[var(--pw-hebrew)]" dir="rtl">
                {selectedInterlinearWord.hebrew}
              </div>
              <div className="text-[var(--pw-text-soft)] text-sm">
                {selectedInterlinearWord.gloss && `→ ${selectedInterlinearWord.gloss}`}
              </div>
            </div>

            {/* Strong’s link */}
            <a
              href={getBlueLetterBibleUrl(selectedInterlinearWord.strongs)}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 font-mono text-sm px-2 py-0.5 rounded border transition-all no-underline hover:underline ${
                selectedLetter
                  ? 'bg-[var(--pw-accent-gold)] text-[#0b1118] border-[var(--pw-accent-gold)] font-semibold'
                  : 'bg-[var(--pw-bg-elevated)] text-[var(--pw-accent-gold)] border-[var(--pw-accent-gold)]/40'
              }`}
              title={desc ? `View ${selectedInterlinearWord.strongs} on Blue Letter Bible — ${desc}` : `View ${selectedInterlinearWord.strongs} on Blue Letter Bible`}
            >
              {selectedInterlinearWord.strongs}
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>

            {/* Definition */}
            {desc && (
              <div className="mt-2 text-sm text-[var(--pw-text-soft)] max-w-prose">
                {desc}
              </div>
            )}
          </div>
        );
      })()}

      <div className="text-[10px] text-[var(--pw-text-faint)]">
        Paleo letter meanings: original practical + symbolic.
      </div>
    </div>
  );
}
