'use client';

import React from 'react';
import { LetterGrid } from './LetterGrid';
import { parseWord, ParsedWord } from '../lib/pictograph';
import { InterlinearWord, ScriptureVerse } from '../data/verses';
import { useUserSettings } from './UserSettingsContext';

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
  const { showEmojis } = useUserSettings();

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
      <div>
        <div className="font-semibold text-lg tracking-tight">Pictographic Breakdown</div>
        <div className="text-sm text-[var(--pw-text-muted)]">
          Letter-by-letter Paleo-Hebrew meanings linked to Strong’s
        </div>
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
