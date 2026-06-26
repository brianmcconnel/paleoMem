import { buildRef, OT_BOOKS } from '../data/books';
import {
  getGreekVerse,
  hasGreekVerseData,
  isGreekNtDataLoaded,
} from '../data/greek-nt';
import { NT_BOOKS, getNtMaxVerse } from '../data/nt-books';
import { getKjvRows } from '../data/scripture-index';
import { getNumberingStatus, resolveHebrewSourceRef } from './kjv-hebrew-ref';
import {
  getKjvText,
  getMaxVerse,
  getVerse,
  hasHebrewVerseData,
  hasKjvVerse,
  isHebrewDataLoaded,
  isKjvDataLoaded,
} from '../data/verses';

export type DisplayIssueReason =
  | 'dataset-not-loaded'
  | 'verse-not-in-data'
  | 'kjv-missing'
  | 'kjv-placeholder'
  | 'kjv-empty'
  | 'hebrew-no-words'
  | 'hebrew-kjv-only-verse'
  | 'hebrew-kjv-extra-verse'
  | 'hebrew-oshb-missing'
  | 'hebrew-words-empty-text'
  | 'greek-no-words'
  | 'greek-kjv-only-fallback'
  | 'greek-dataset-missing-verse'
  | 'greek-words-empty-text';

export type DisplaySide = 'english' | 'hebrew' | 'greek';

export type DisplaySideResult = {
  renders: boolean;
  reason?: DisplayIssueReason;
  detail?: string;
  expected?: boolean;
};

export type VerseDisplayAudit = {
  ref: string;
  book: string;
  chapter: number;
  verse: number;
  english: DisplaySideResult;
  hebrew?: DisplaySideResult;
  greek?: DisplaySideResult;
  hebrewSourceRef?: string;
  numberingKind?: string;
};

export type DisplayIssueGroup = {
  side: DisplaySide;
  reason: DisplayIssueReason;
  description: string;
  expected: boolean;
  refs: string[];
};

export type SectionDisplaySummary = {
  section: string;
  book: string;
  chapter: number;
  verses: number;
  englishIssues: number;
  hebrewIssues: number;
  greekIssues: number;
  reasons: string[];
  sampleRefs: string[];
};

export type TestamentVerificationTotals = {
  verses: number;
  englishOk: number;
  secondaryOk: number;
  englishIssues: number;
  secondaryIssues: number;
  unexpectedEnglishIssues: number;
  unexpectedSecondaryIssues: number;
  greekStrongsGaps?: number;
};

export type TestamentVerificationResult = {
  testament: 'OT' | 'NT';
  secondarySide: 'hebrew' | 'greek';
  totals: TestamentVerificationTotals;
  issuesByReason: DisplayIssueGroup[];
  sectionsWithIssues: SectionDisplaySummary[];
  issues: VerseDisplayAudit[];
};

export type DisplayVerificationReport = {
  generatedAt: string;
  oldTestament: TestamentVerificationResult;
  newTestament: TestamentVerificationResult;
};

const REASON_DESCRIPTIONS: Record<DisplayIssueReason, string> = {
  'dataset-not-loaded':
    'Bible dataset JSON is missing. Run `npm run data:fetch` before verifying display.',
  'verse-not-in-data':
    'No verse record is returned by the loader; the reader shows “No text” / “not found”.',
  'kjv-missing': 'KJV JSON has no entry for this reference.',
  'kjv-placeholder': 'KJV helper returned a placeholder error string instead of verse text.',
  'kjv-empty': 'Verse exists but the KJV field is empty.',
  'hebrew-no-words':
    'Verse loads but the interlinear words array is empty, so the Hebrew panel has no graphemes.',
  'hebrew-kjv-only-verse':
    'KJV verse has no OSHB Hebrew counterpart (known numbering divergence).',
  'hebrew-kjv-extra-verse':
    'KJV includes this verse number but OSHB ends earlier in the chapter (often a numbering split).',
  'hebrew-oshb-missing':
    'Mapped OSHB source reference exists in logic but is missing from ot-hebrew.json.',
  'hebrew-words-empty-text':
    'Word entries exist but every Hebrew token is blank after normalization.',
  'greek-no-words':
    'Verse loads but the Greek words array is empty, so the reader shows KJV only.',
  'greek-kjv-only-fallback':
    'KJV includes this verse but SBLGNT / MorphGNT has no Greek row (known KJV-only or numbering divergence).',
  'greek-dataset-missing-verse':
    'KJV NT verse exists but nt-greek.json has no row (MorphGNT gap).',
  'greek-words-empty-text':
    'Word entries exist but every Greek token is blank after normalization.',
};

function hasNtKjvVerse(book: string, chapter: number, verse: number): boolean {
  const ntBook = NT_BOOKS.find((b) => b.name === book);
  if (!ntBook) return false;
  return getKjvRows().some(
    (row) => row.book === ntBook.kjvKey && row.chapter === chapter && row.verse === verse,
  );
}

function auditEnglish(book: string, chapter: number, verse: number): DisplaySideResult {
  if (!isKjvDataLoaded()) {
    return {
      renders: false,
      reason: 'dataset-not-loaded',
      detail: 'kjv.json not loaded',
    };
  }

  const ref = buildRef(book, chapter, verse);
  const verseData = getVerse(ref);
  if (!verseData) {
    if (!hasKjvVerse(book, chapter, verse)) {
      return {
        renders: false,
        reason: 'verse-not-in-data',
        detail: 'getVerse() returned undefined and KJV JSON has no row',
      };
    }
    return {
      renders: false,
      reason: 'verse-not-in-data',
      detail: 'getVerse() returned undefined (KJV text may be shorter than loader threshold)',
    };
  }

  const kjv = verseData.kjv.trim();
  if (!kjv) {
    return { renders: false, reason: 'kjv-empty', detail: 'KJV field is blank' };
  }

  if (kjv.startsWith('KJV data not loaded')) {
    return {
      renders: false,
      reason: 'dataset-not-loaded',
      detail: kjv,
    };
  }

  if (kjv.startsWith('KJV text not available')) {
    return {
      renders: false,
      reason: hasKjvVerse(book, chapter, verse) ? 'kjv-placeholder' : 'kjv-missing',
      detail: hasKjvVerse(book, chapter, verse)
        ? getKjvText(book, chapter, verse)
        : `No KJV row for ${ref}; navigator may include extra verses from OSHB chapter length`,
    };
  }

  return { renders: true };
}

function auditNtEnglish(book: string, chapter: number, verse: number): DisplaySideResult {
  if (!isKjvDataLoaded()) {
    return {
      renders: false,
      reason: 'dataset-not-loaded',
      detail: 'kjv.json not loaded',
    };
  }

  const ref = buildRef(book, chapter, verse);
  if (!hasNtKjvVerse(book, chapter, verse)) {
    return {
      renders: false,
      reason: 'kjv-missing',
      detail: `No KJV row for ${ref}`,
    };
  }

  const verseData = getGreekVerse(ref);
  if (!verseData) {
    return {
      renders: false,
      reason: 'verse-not-in-data',
      detail: 'getGreekVerse() returned undefined',
    };
  }

  const kjv = verseData.kjv.trim();
  if (!kjv) {
    return { renders: false, reason: 'kjv-empty', detail: 'KJV field is blank' };
  }

  return { renders: true };
}

function auditHebrew(book: string, chapter: number, verse: number): DisplaySideResult {
  if (!isHebrewDataLoaded()) {
    return {
      renders: false,
      reason: 'dataset-not-loaded',
      detail: 'ot-hebrew.json not loaded',
    };
  }

  const ref = buildRef(book, chapter, verse);
  const numberingStatus = getNumberingStatus(book, chapter, verse);
  const hebrewSourceRef = resolveHebrewSourceRef(book, chapter, verse) ?? undefined;
  const verseData = getVerse(ref);

  if (!verseData) {
    return {
      renders: false,
      reason: 'verse-not-in-data',
      detail: 'getVerse() returned undefined',
    };
  }

  const words = verseData.words.filter((w) => w.hebrew.trim().length > 0);
  if (words.length > 0) {
    return { renders: true };
  }

  if (numberingStatus.kind === 'kjv-only') {
    return {
      renders: false,
      reason: 'hebrew-kjv-only-verse',
      detail: numberingStatus.summary,
      expected: true,
    };
  }

  if (hebrewSourceRef) {
    if (!hasHebrewVerseData(hebrewSourceRef)) {
      const sameRef = hebrewSourceRef === ref;
      const kjvHasVerse = hasKjvVerse(book, chapter, verse);
      return {
        renders: false,
        reason: sameRef && kjvHasVerse ? 'hebrew-kjv-extra-verse' : 'hebrew-oshb-missing',
        detail: sameRef
          ? `KJV ${ref} exists but OSHB has no verse ${verse} in ${book} ${chapter}`
          : `Expected OSHB at ${hebrewSourceRef}`,
        expected: sameRef && kjvHasVerse && numberingStatus.kind === 'chapter-divergence',
      };
    }

    const sourceVerse = getVerse(hebrewSourceRef);
    if (sourceVerse && sourceVerse.words.some((w) => w.hebrew.trim().length > 0)) {
      return {
        renders: false,
        reason: 'hebrew-no-words',
        detail: `OSHB ${hebrewSourceRef} has words but KJV ${ref} resolved with an empty words array`,
      };
    }

    return {
      renders: false,
      reason: 'hebrew-words-empty-text',
      detail: hebrewSourceRef,
    };
  }

  if (verseData.words.length > 0) {
    return {
      renders: false,
      reason: 'hebrew-words-empty-text',
      detail: 'Word rows exist but Hebrew tokens are blank',
    };
  }

  return {
    renders: false,
    reason: 'hebrew-no-words',
    detail: 'No Hebrew words and no explicit KJV-only numbering flag',
  };
}

function auditGreek(book: string, chapter: number, verse: number): DisplaySideResult {
  if (!isGreekNtDataLoaded()) {
    return {
      renders: false,
      reason: 'dataset-not-loaded',
      detail: 'nt-greek.json not loaded — run npm run data:fetch:greek',
    };
  }

  const ref = buildRef(book, chapter, verse);
  const verseData = getGreekVerse(ref);

  if (!verseData) {
    return {
      renders: false,
      reason: 'verse-not-in-data',
      detail: 'getGreekVerse() returned undefined',
    };
  }

  if (verseData.source.includes('KJV only')) {
    return {
      renders: false,
      reason: 'greek-kjv-only-fallback',
      detail: verseData.source,
      expected: hasNtKjvVerse(book, chapter, verse),
    };
  }

  if (!hasGreekVerseData(ref)) {
    return {
      renders: false,
      reason: 'greek-dataset-missing-verse',
      detail: `KJV ${ref} exists but nt-greek.json has no entry`,
    };
  }

  const words = verseData.words.filter((w) => w.greek.trim().length > 0);
  if (words.length > 0) {
    return { renders: true };
  }

  if (verseData.words.length > 0) {
    return {
      renders: false,
      reason: 'greek-words-empty-text',
      detail: 'Word rows exist but Greek tokens are blank',
    };
  }

  return {
    renders: false,
    reason: 'greek-no-words',
    detail: 'Greek verse row exists with an empty words array',
  };
}

export function auditVerseDisplay(book: string, chapter: number, verse: number): VerseDisplayAudit {
  const ref = buildRef(book, chapter, verse);
  const numberingStatus = getNumberingStatus(book, chapter, verse);
  const hebrewSourceRef = resolveHebrewSourceRef(book, chapter, verse) ?? undefined;

  return {
    ref,
    book,
    chapter,
    verse,
    english: auditEnglish(book, chapter, verse),
    hebrew: auditHebrew(book, chapter, verse),
    hebrewSourceRef: hebrewSourceRef !== ref ? hebrewSourceRef : undefined,
    numberingKind: numberingStatus.kind === 'aligned' ? undefined : numberingStatus.kind,
  };
}

export function auditKoineVerseDisplay(
  book: string,
  chapter: number,
  verse: number,
): VerseDisplayAudit {
  const ref = buildRef(book, chapter, verse);

  return {
    ref,
    book,
    chapter,
    verse,
    english: auditNtEnglish(book, chapter, verse),
    greek: auditGreek(book, chapter, verse),
  };
}

function buildTestamentReport(
  testament: 'OT' | 'NT',
  secondarySide: 'hebrew' | 'greek',
  issues: VerseDisplayAudit[],
  verseCount: number,
  getMaxVerseForSection: (book: string, chapter: number) => number,
  greekStrongsGaps?: number,
): TestamentVerificationResult {
  const secondaryKey = secondarySide;
  let englishOk = 0;
  let secondaryOk = 0;

  for (const audit of issues) {
    if (audit.english.renders) englishOk += 1;
    const secondary = audit[secondaryKey];
    if (secondary?.renders) secondaryOk += 1;
  }

  const allAudits = issues;
  const versesWithIssues = allAudits.filter(
    (audit) => !audit.english.renders || !audit[secondaryKey]?.renders,
  );

  const groupMap = new Map<string, DisplayIssueGroup>();
  for (const audit of versesWithIssues) {
    for (const side of ['english', secondarySide] as const) {
      const result = audit[side];
      if (!result || result.renders || !result.reason) continue;

      const key = `${side}:${result.reason}:${result.expected ? 'expected' : 'unexpected'}`;
      const existing = groupMap.get(key);
      if (existing) {
        existing.refs.push(audit.ref);
        continue;
      }

      groupMap.set(key, {
        side,
        reason: result.reason,
        description: REASON_DESCRIPTIONS[result.reason],
        expected: !!result.expected,
        refs: [audit.ref],
      });
    }
  }

  const issuesByReason = Array.from(groupMap.values()).sort((a, b) => {
    if (a.side !== b.side) return a.side.localeCompare(b.side);
    if (a.expected !== b.expected) return a.expected ? 1 : -1;
    return b.refs.length - a.refs.length;
  });

  const sectionMap = new Map<string, SectionDisplaySummary>();
  for (const audit of versesWithIssues) {
    const key = `${audit.book}:${audit.chapter}`;
    const section = sectionMap.get(key) ?? {
      section: `${audit.book} ${audit.chapter}`,
      book: audit.book,
      chapter: audit.chapter,
      verses: getMaxVerseForSection(audit.book, audit.chapter),
      englishIssues: 0,
      hebrewIssues: 0,
      greekIssues: 0,
      reasons: [],
      sampleRefs: [],
    };

    if (!audit.english.renders) section.englishIssues += 1;
    const secondary = audit[secondaryKey];
    if (!secondary?.renders) {
      if (secondarySide === 'hebrew') section.hebrewIssues += 1;
      else section.greekIssues += 1;
    }

    for (const side of ['english', secondarySide] as const) {
      const result = audit[side];
      if (result && !result.renders && result.reason) {
        const tag = `${side}:${result.reason}`;
        if (!section.reasons.includes(tag)) section.reasons.push(tag);
      }
    }

    if (section.sampleRefs.length < 5) section.sampleRefs.push(audit.ref);
    sectionMap.set(key, section);
  }

  const sectionsWithIssues = Array.from(sectionMap.values()).sort((a, b) => {
    const issueDelta =
      b.englishIssues +
      b.hebrewIssues +
      b.greekIssues -
      (a.englishIssues + a.hebrewIssues + a.greekIssues);
    if (issueDelta !== 0) return issueDelta;
    return a.section.localeCompare(b.section);
  });

  const englishIssues = versesWithIssues.filter((i) => !i.english.renders).length;
  const secondaryIssues = versesWithIssues.filter((i) => !i[secondaryKey]?.renders).length;
  const unexpectedEnglishIssues = versesWithIssues.filter(
    (i) => !i.english.renders && !i.english.expected,
  ).length;
  const unexpectedSecondaryIssues = versesWithIssues.filter(
    (i) => !i[secondaryKey]?.renders && !i[secondaryKey]?.expected,
  ).length;

  return {
    testament,
    secondarySide,
    totals: {
      verses: verseCount,
      englishOk,
      secondaryOk,
      englishIssues,
      secondaryIssues,
      unexpectedEnglishIssues,
      unexpectedSecondaryIssues,
      greekStrongsGaps,
    },
    issuesByReason,
    sectionsWithIssues,
    issues: versesWithIssues,
  };
}

export function auditAllVerseDisplays(): TestamentVerificationResult {
  const issues: VerseDisplayAudit[] = [];
  let verses = 0;

  for (const book of OT_BOOKS) {
    for (let chapter = 1; chapter <= book.chapters; chapter += 1) {
      const maxVerse = getMaxVerse(book.name, chapter);
      for (let verse = 1; verse <= maxVerse; verse += 1) {
        verses += 1;
        issues.push(auditVerseDisplay(book.name, chapter, verse));
      }
    }
  }

  return buildTestamentReport('OT', 'hebrew', issues, verses, getMaxVerse);
}

export function auditAllKoineVerseDisplays(): TestamentVerificationResult {
  const issues: VerseDisplayAudit[] = [];
  let verses = 0;
  let greekStrongsGaps = 0;

  for (const book of NT_BOOKS) {
    for (let chapter = 1; chapter <= book.chapters; chapter += 1) {
      const maxVerse = getNtMaxVerse(book.name, chapter);
      for (let verse = 1; verse <= maxVerse; verse += 1) {
        verses += 1;
        const audit = auditKoineVerseDisplay(book.name, chapter, verse);
        issues.push(audit);

        const loaded = getGreekVerse(audit.ref);
        if (loaded?.words.length) {
          greekStrongsGaps += loaded.words.filter((w) => !w.strongs.trim()).length;
        }
      }
    }
  }

  return buildTestamentReport('NT', 'greek', issues, verses, getNtMaxVerse, greekStrongsGaps);
}

export function auditDisplayVerification(): DisplayVerificationReport {
  return {
    generatedAt: new Date().toISOString(),
    oldTestament: auditAllVerseDisplays(),
    newTestament: auditAllKoineVerseDisplays(),
  };
}

function formatTestamentResult(result: TestamentVerificationResult): string[] {
  const lines: string[] = [];
  const secondaryLabel = result.secondarySide === 'hebrew' ? 'Hebrew' : 'Greek';
  const { totals } = result;

  lines.push(
    `${result.testament} — scanned ${totals.verses} verses — English OK: ${totals.englishOk}, ${secondaryLabel} OK: ${totals.secondaryOk}`,
  );
  lines.push(
    `  Issues — English: ${totals.englishIssues} (${totals.unexpectedEnglishIssues} unexpected), ${secondaryLabel}: ${totals.secondaryIssues} (${totals.unexpectedSecondaryIssues} unexpected)`,
  );

  if (typeof totals.greekStrongsGaps === 'number') {
    lines.push(
      `  Greek words without Strong's mapping: ${totals.greekStrongsGaps} (informational — display still OK)`,
    );
  }

  if (result.issuesByReason.length === 0) {
    lines.push(`  All verses render English and ${secondaryLabel} text.`);
    return lines;
  }

  lines.push('  Issues grouped by reason:');
  for (const group of result.issuesByReason) {
    const label = group.expected ? 'expected' : 'ACTION NEEDED';
    lines.push(
      `    [${group.side.toUpperCase()}] ${group.reason} (${group.refs.length}) — ${label}`,
    );
    lines.push(`      ${group.description}`);
    const preview = group.refs.slice(0, 8);
    lines.push(
      `      Refs: ${preview.join(', ')}${group.refs.length > 8 ? ` … +${group.refs.length - 8} more` : ''}`,
    );
  }

  if (result.sectionsWithIssues.length > 0) {
    lines.push('  Sections with display issues (by chapter):');
    for (const section of result.sectionsWithIssues.slice(0, 20)) {
      const secondaryCount =
        result.secondarySide === 'hebrew' ? section.hebrewIssues : section.greekIssues;
      lines.push(
        `    ${section.section} — English: ${section.englishIssues}, ${secondaryLabel}: ${secondaryCount} (${section.reasons.join(', ')})`,
      );
      lines.push(`      Examples: ${section.sampleRefs.join(', ')}`);
    }
    if (result.sectionsWithIssues.length > 20) {
      lines.push(`    … +${result.sectionsWithIssues.length - 20} more sections (see JSON report)`);
    }
  }

  return lines;
}

export function formatDisplayVerificationReport(report: DisplayVerificationReport): string {
  const lines: string[] = [];
  lines.push('paleoMem + koineHydata display verification');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push('');
  lines.push(...formatTestamentResult(report.oldTestament));
  lines.push('');
  lines.push(...formatTestamentResult(report.newTestament));
  return lines.join('\n');
}