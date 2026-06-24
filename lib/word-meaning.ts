import { InterlinearWord } from '../data/verses';
import { parseWord, ParsedWord } from './pictograph';
import { getStrongsDef } from './strongs';

export type VerseWordSegment = {
  wordId: number;
  hebrew: string;
  strongs: string;
  symbolicPart: string;
  practicalPart: string;
  emojiPart: string;
};

export type VerseMeaningSynthesis = {
  symbolicMeaning: string;
  practicalMeaning: string;
  emojiString: string;
  words: VerseWordSegment[];
};

function wordSymbolicPart(parsed: ParsedWord): string {
  if (!parsed.letters.length) return '';
  return parsed.letters.map((l) => l.info.meaning.trim()).join(' → ');
}

function wordPracticalPart(parsed: ParsedWord, strongsDef: string): string {
  const forms = parsed.letters.map((l) => l.info.paleo);
  const pictorial = forms.length ? forms.join(' → ') : '';
  const lexical = strongsDef.trim();

  if (pictorial && lexical) return `${pictorial} (${lexical})`;
  return pictorial || lexical;
}

function wordEmojiPart(parsed: ParsedWord): string {
  return parsed.letters.map((l) => l.info.emoji).join(' ');
}

/** Programmatic verse-level synthesis from all words in reading order */
export function synthesizeVerseMeaning(words: InterlinearWord[]): VerseMeaningSynthesis {
  const segments: VerseWordSegment[] = words.map((word) => {
    const parsed = parseWord(word.hebrew);
    const strongsDef = getStrongsDef(word.strongs);

    return {
      wordId: word.id,
      hebrew: word.hebrew,
      strongs: word.strongs,
      symbolicPart: wordSymbolicPart(parsed),
      practicalPart: wordPracticalPart(parsed, strongsDef),
      emojiPart: wordEmojiPart(parsed),
    };
  });

  const symbolicParts = segments.map((s) => s.symbolicPart).filter(Boolean);
  const practicalParts = segments.map((s) => s.practicalPart).filter(Boolean);
  const emojiParts = segments.map((s) => s.emojiPart).filter(Boolean);

  const symbolicMeaning =
    symbolicParts.length > 0 ? symbolicParts.join(' → ') : '';

  const practicalMeaning =
    practicalParts.length > 0 ? practicalParts.join(' → ') : '';

  const emojiString = emojiParts.join(' ');

  return {
    symbolicMeaning,
    practicalMeaning,
    emojiString,
    words: segments,
  };
}