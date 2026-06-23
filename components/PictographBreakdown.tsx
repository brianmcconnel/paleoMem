'use client';

import React, { useState } from 'react';
import { LetterGrid } from './LetterGrid';
import { parseWord, ParsedWord } from '../lib/pictograph';
import { InterlinearWord, ScriptureVerse } from '../data/verses';

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

      <div className="text-[10px] text-[var(--pw-text-faint)]">
        Paleo letter meanings: original practical + symbolic.
      </div>
    </div>
  );
}
