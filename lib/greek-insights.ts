import type { GreekInterlinearWord } from '../data/greek-nt';
import { getStrongs } from './strongs';

export type GreekWordInsight = {
  title: string;
  etymology: string;
  symbolism?: string;
  devotional?: string;
};

const CURATED: Record<string, GreekWordInsight> = {
  G746: {
    title: 'ἀρχή (archē) — beginning',
    etymology: 'Noun from the verbal root ἀρχ- (“to rule, begin”). Shares the “first / origin” idea with Genesis 1:1 Hebrew רֵאשִׁית (reshit).',
    symbolism:
      'John opens with the same cosmic “in the beginning” frame as Genesis 1:1 — now applied to the pre-incarnate Christ.',
    devotional: 'The Word was already present at the origin of all things.',
  },
  G3056: {
    title: 'λόγος (logos) — Word',
    etymology: 'From λέγω (legō, G3004) “to say, speak, lay forth.” A logos is something uttered — speech, reason, account, message.',
    symbolism:
      'In Jewish Greek (cf. LXX) and Hellenistic thought, logos bridges divine speech and rational order. Here it names the personal Word who is God-with-us.',
    devotional:
      'Not a pictograph layer — study the word’s usage and context. In John 1:1 the Logos is a person, not an abstract principle.',
  },
  G2316: {
    title: 'θεός (theos) — God',
    etymology: 'Indo-European stock word for deity; in Koine NT usage it denotes the one true God (often with the article) or, in predicate, divine nature.',
    symbolism:
      'The climax of the verse: the Word was (imperfect ἦν) toward God and was God — identity and relation in the same breath.',
  },
  G1722: {
    title: 'ἐν (en) — in',
    etymology: 'Primary preposition of position and means; cognate sphere with English “in.”',
    symbolism: 'Locates the Word at the beginning — the setting of creation’s opening scene.',
  },
  G4314: {
    title: 'πρός (pros) — toward / with',
    etymology: 'Preposition marking direction, face-to-face orientation, or relation (toward, with).',
    symbolism:
      'The Word was πρὸς τὸν θεόν — oriented toward God, in fellowship, not merely beside as an object.',
  },
  G2258: {
    title: 'ἦν (ēn) — was',
    etymology: 'Imperfect of εἰμί (eimi, G1510) “to be.” The imperfect stresses ongoing state in past time.',
    symbolism: 'Repeated three times: the Word’s being is continuous before creation’s narrative unfolds.',
  },
};

export const MU_WATERS_INSIGHT = {
  letter: 'Μ μ',
  name: 'Mu',
  paleo: 'Water / waves (Semitic pictograph lineage)',
  hebrewParallel: 'Hebrew מ (Mem) — mayim (מַיִם, waters)',
  greekWord: 'ὕδωρ / ὕδατα (hydōr / hydata — water / waters)',
  note:
    'Mu is the Greek letter that continues the ancient water-pictograph line behind Hebrew Mem. The NT does not use letter pictographs devotionally; koineHydata studies Koine words — especially water and life themes (baptism, living water, Spirit) — rather than per-letter emoji breakdowns.',
};

export function getGreekWordInsight(word: GreekInterlinearWord): GreekWordInsight {
  const curated = CURATED[word.strongs.toUpperCase()];
  if (curated) return curated;

  const entry = getStrongs(word.strongs);
  const derivation = entry?.derivation?.trim();
  const definition = entry?.strongs_def?.trim() || entry?.kjv_def?.trim() || '';

  if (word.strongs === 'G3588') {
    return {
      title: `${word.greek} — definite article`,
      etymology: 'The Greek article specifies known identity (“the”); forms vary by case and gender.',
      devotional: 'Grammatical word — insight focuses on the nouns it specifies (λόγος, θεός).',
    };
  }

  if (word.strongs === 'G2532') {
    return {
      title: `${word.greek} (kai) — and`,
      etymology: 'Primary coordinating conjunction; links the three clauses of John 1:1.',
    };
  }

  return {
    title: word.greek,
    etymology: derivation
      ? `${derivation} ${definition}`.trim()
      : definition || 'See Strong\'s entry for full gloss.',
  };
}