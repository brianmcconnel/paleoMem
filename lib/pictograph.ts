/**
 * paleoMem — Core Paleo-Hebrew Pictograph Engine
 * Programmatic letter-by-letter pictographic analysis.
 *
 * Letters use standard final-form normalization (ך→כ etc).
 */

export type PaleoLetter = {
  letter: string; // modern char used as key
  name: string; // e.g. "Aleph"
  paleo: string; // short description of ancient form
  meaning: string; // concise core concept(s)
  emoji: string;
  notes?: string;
};

export const LETTERS: Record<string, PaleoLetter> = {
  א: {
    letter: 'א',
    name: 'Aleph',
    paleo: 'Ox head',
    meaning: 'Strength, Leader, First, God, Thousand',
    emoji: '🐂',
    notes: 'Head of the alphabet. Power and beginning.',
  },
  ב: {
    letter: 'ב',
    name: 'Bet',
    paleo: 'House / Tent',
    meaning: 'House, Family, In, Within, Son of',
    emoji: '🏠',
  },
  ג: {
    letter: 'ג',
    name: 'Gimel',
    paleo: 'Camel foot',
    meaning: 'Lift up, Reward, Pride, To walk',
    emoji: '🐪',
  },
  ד: {
    letter: 'ד',
    name: 'Dalet',
    paleo: 'Door / Tent flap',
    meaning: 'Door, Pathway, Movement, To enter',
    emoji: '🚪',
  },
  ה: {
    letter: 'ה',
    name: 'He',
    paleo: 'Window / Breath',
    meaning: 'Behold, Reveal, Breath, The, Look',
    emoji: '👁️',
  },
  ו: {
    letter: 'ו',
    name: 'Vav',
    paleo: 'Hook / Peg / Nail',
    meaning: 'And, Secure, Join, Add, Nail',
    emoji: '🔗',
  },
  ז: {
    letter: 'ז',
    name: 'Zayin',
    paleo: 'Plow / Weapon',
    meaning: 'Cut, Nourish, Weapon, Food from toil',
    emoji: '🌾',
  },
  ח: {
    letter: 'ח',
    name: 'Chet',
    paleo: 'Wall / Fence',
    meaning: 'Inner chamber, Separate, Private, Sin (barrier)',
    emoji: '🧱',
  },
  ט: {
    letter: 'ט',
    name: 'Tet',
    paleo: 'Basket / Snake coiled',
    meaning: 'Surround, Twist, Good within, Hidden',
    emoji: '🧺',
  },
  י: {
    letter: 'י',
    name: 'Yod',
    paleo: 'Hand / Arm',
    meaning: 'Hand, Work, Deed, Power, My (possessive)',
    emoji: '✋',
  },
  כ: {
    letter: 'כ',
    name: 'Kaf',
    paleo: 'Palm of hand',
    meaning: 'Open palm, Cover, Bend, Tame, Like / As',
    emoji: '🖐️',
  },
  ל: {
    letter: 'ל',
    name: 'Lamed',
    paleo: 'Shepherd staff / Goad',
    meaning: 'Teach, Learn, Authority, Toward, To',
    emoji: '🐑',
  },
  מ: {
    letter: 'מ',
    name: 'Mem',
    paleo: 'Water / Waves',
    meaning: 'Water, Massive, Chaos, Womb, From / Out of',
    emoji: '💧',
  },
  נ: {
    letter: 'נ',
    name: 'Nun',
    paleo: 'Fish / Sprouting seed',
    meaning: 'Life, Continue, Heir, Faithful, Son / Offspring',
    emoji: '🐟',
  },
  ס: {
    letter: 'ס',
    name: 'Samekh',
    paleo: 'Prop / Support',
    meaning: 'Support, Protect, Turn, Trust',
    emoji: '🛡️',
  },
  ע: {
    letter: 'ע',
    name: 'Ayin',
    paleo: 'Eye',
    meaning: 'Eye, See, Know, Watch, Experience, Affliction',
    emoji: '👁️',
  },
  פ: {
    letter: 'פ',
    name: 'Pe',
    paleo: 'Mouth',
    meaning: 'Mouth, Speak, Blow, Edge, Open, Word',
    emoji: '👄',
  },
  צ: {
    letter: 'צ',
    name: 'Tsade',
    paleo: 'Fish hook / Man hunting',
    meaning: 'Hunt, Desire, Righteous, Capture, Side',
    emoji: '🎣',
  },
  ק: {
    letter: 'ק',
    name: 'Qof',
    paleo: 'Back of head / Sunrise horizon',
    meaning: 'Circle, Time, Horizon, Behind, Condense, Sun',
    emoji: '☀️',
  },
  ר: {
    letter: 'ר',
    name: 'Resh',
    paleo: 'Head of man',
    meaning: 'Head, Highest, First, Chief, Poison',
    emoji: '👤',
  },
  ש: {
    letter: 'ש',
    name: 'Shin',
    paleo: 'Teeth',
    meaning: 'Consume, Devour, Sharp, Two, Peace (shin), Fire',
    emoji: '🦷',
  },
  ת: {
    letter: 'ת',
    name: 'Tav',
    paleo: 'Mark / Cross / Sign',
    meaning: 'Sign, Covenant, Seal, Cross, Ownership, End',
    emoji: '✝️',
  },
};

// Final forms normalized to base
const FINAL_MAP: Record<string, string> = {
  ך: 'כ',
  ם: 'מ',
  ן: 'נ',
  ף: 'פ',
  ץ: 'צ',
};

export function normalizeLetter(ch: string): string | null {
  if (!ch) return null;
  const base = FINAL_MAP[ch] || ch;
  return LETTERS[base] ? base : null;
}

export function getLetterInfo(ch: string): PaleoLetter | null {
  const key = normalizeLetter(ch);
  return key ? LETTERS[key] : null;
}

export type ParsedLetter = {
  original: string;
  normalized: string;
  info: PaleoLetter;
};

export type ParsedWord = {
  original: string; // with or without niqqud
  letters: ParsedLetter[];
  pictograph: string; // joined meanings or emoji sentence
};

export type VersePictographs = {
  words: ParsedWord[];
  letterCount: number;
  uniqueLetters: string[];
};

/** Strip Hebrew niqqud / cantillation / punctuation for analysis */
export function stripPoints(text: string): string {
  // Remove Hebrew vowel points, cantillation, and some punctuation
  return text
    .replace(/[\u0591-\u05C7\u05BE\u05C0\u05C3\u05F3\u05F4]/g, '') // points + punctuation
    .replace(/[־׃׀]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Split verse into words preserving original */
export function splitWords(verse: string): string[] {
  return verse.trim().split(/\s+/).filter(Boolean);
}

/** Parse a single word (Hebrew) into letters + pictographic data */
export function parseWord(word: string): ParsedWord {
  const original = word.replace(/\//g, '');
  const cleaned = stripPoints(original);
  const letters: ParsedLetter[] = [];

  for (const ch of cleaned) {
    if (/[\s\u05BE\u05C0\u05C3.,;:!?׃־]/.test(ch)) continue;
    const norm = normalizeLetter(ch);
    if (!norm) continue;
    const info = LETTERS[norm]!;
    letters.push({ original: ch, normalized: norm, info });
  }

  // Build a compact pictograph representation: "In (house) beginning (head) ..."
  const pictograph = letters.map(l => `${l.info.name}(${l.info.emoji})`).join(' · ');

  return { original, letters, pictograph };
}

/** Parse a full verse into words + aggregate stats */
export function parseVerse(verseHebrew: string): VersePictographs {
  const wordsRaw = splitWords(verseHebrew);
  const words = wordsRaw.map(parseWord);

  const allLetters = words.flatMap(w => w.letters.map(l => l.normalized));
  const unique = Array.from(new Set(allLetters)).sort();

  return {
    words,
    letterCount: allLetters.length,
    uniqueLetters: unique,
  };
}

/** Build a nice "pictographic sentence" summary using primary meaning keywords */
export function buildPictographSentence(parsed: VersePictographs): string {
  const firstWords = parsed.words.slice(0, 6);
  return firstWords
    .map(w => {
      if (!w.letters.length) return w.original;
      const key = w.letters[0].info.meaning.split(',')[0].toLowerCase();
      return key;
    })
    .join(' · ');
}

/** Toggle emoji version of breakdown */
export function renderLettersWithEmojis(letters: ParsedLetter[], showEmoji: boolean): string {
  return letters.map(l => (showEmoji ? `${l.normalized} ${l.info.emoji}` : l.normalized)).join(' ');
}

/** Generate Blue Letter Bible link for a Strong's reference */
export function getBlueLetterBibleUrl(strongs: string): string {
  const match = strongs.match(/^([HG])(\d+)$/i);
  if (!match) {
    return `https://www.blueletterbible.org/lang/lexicon/lexicon.cfm?Strongs=${encodeURIComponent(strongs)}&t=KJV`;
  }
  const [, type, num] = match;
  const t = type.toLowerCase();
  if (t === 'h') {
    // Hebrew (WLC)
    return `https://www.blueletterbible.org/lexicon/h${num}/kjv/wlc/0-1/`;
  }
  if (t === 'g') {
    // Greek (TR)
    return `https://www.blueletterbible.org/lexicon/g${num}/kjv/tr/0-1/`;
  }
  return `https://www.blueletterbible.org/lang/lexicon/lexicon.cfm?Strongs=${encodeURIComponent(strongs)}&t=KJV`;
}
