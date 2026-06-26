import { buildRef, OT_BOOKS } from '../data/books';
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
  | 'hebrew-words-empty-text';

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
  hebrew: DisplaySideResult;
  hebrewSourceRef?: string;
  numberingKind?: string;
};

export type DisplayIssueGroup = {
  side: 'english' | 'hebrew';
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
  reasons: string[];
  sampleRefs: string[];
};

export type DisplayVerificationReport = {
  generatedAt: string;
  totals: {
    verses: number;
    englishOk: number;
    hebrewOk: number;
    englishIssues: number;
    hebrewIssues: number;
    unexpectedEnglishIssues: number;
    unexpectedHebrewIssues: number;
  };
  issuesByReason: DisplayIssueGroup[];
  sectionsWithIssues: SectionDisplaySummary[];
  issues: VerseDisplayAudit[];
};

const REASON_DESCRIPTIONS: Record<DisplayIssueReason, string> = {
  'dataset-not-loaded':
    'Bible dataset JSON is missing. Run `npm run data:fetch` before verifying display.',
  'verse-not-in-data':
    'No verse record is returned by getVerse(); the reader shows “No text” / “Hebrew not found”.',
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
};

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

export function auditAllVerseDisplays(): DisplayVerificationReport {
  const issues: VerseDisplayAudit[] = [];
  let verses = 0;
  let englishOk = 0;
  let hebrewOk = 0;

  for (const book of OT_BOOKS) {
    for (let chapter = 1; chapter <= book.chapters; chapter += 1) {
      const maxVerse = getMaxVerse(book.name, chapter);
      for (let verse = 1; verse <= maxVerse; verse += 1) {
        verses += 1;
        const audit = auditVerseDisplay(book.name, chapter, verse);
        if (audit.english.renders) englishOk += 1;
        if (audit.hebrew.renders) hebrewOk += 1;

        if (!audit.english.renders || !audit.hebrew.renders) {
          issues.push(audit);
        }
      }
    }
  }

  const groupMap = new Map<string, DisplayIssueGroup>();

  for (const audit of issues) {
    for (const side of ['english', 'hebrew'] as const) {
      const result = audit[side];
      if (result.renders || !result.reason) continue;

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
  for (const audit of issues) {
    const key = `${audit.book}:${audit.chapter}`;
    const section = sectionMap.get(key) ?? {
      section: `${audit.book} ${audit.chapter}`,
      book: audit.book,
      chapter: audit.chapter,
      verses: getMaxVerse(audit.book, audit.chapter),
      englishIssues: 0,
      hebrewIssues: 0,
      reasons: [],
      sampleRefs: [],
    };

    if (!audit.english.renders) section.englishIssues += 1;
    if (!audit.hebrew.renders) section.hebrewIssues += 1;

    for (const side of ['english', 'hebrew'] as const) {
      const result = audit[side];
      if (!result.renders && result.reason) {
        const tag = `${side}:${result.reason}`;
        if (!section.reasons.includes(tag)) section.reasons.push(tag);
      }
    }

    if (section.sampleRefs.length < 5) section.sampleRefs.push(audit.ref);
    sectionMap.set(key, section);
  }

  const sectionsWithIssues = Array.from(sectionMap.values()).sort((a, b) => {
    const issueDelta =
      b.englishIssues + b.hebrewIssues - (a.englishIssues + a.hebrewIssues);
    if (issueDelta !== 0) return issueDelta;
    return a.section.localeCompare(b.section);
  });

  const englishIssues = issues.filter((i) => !i.english.renders).length;
  const hebrewIssues = issues.filter((i) => !i.hebrew.renders).length;
  const unexpectedEnglishIssues = issues.filter(
    (i) => !i.english.renders && !i.english.expected,
  ).length;
  const unexpectedHebrewIssues = issues.filter(
    (i) => !i.hebrew.renders && !i.hebrew.expected,
  ).length;

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      verses,
      englishOk,
      hebrewOk,
      englishIssues,
      hebrewIssues,
      unexpectedEnglishIssues,
      unexpectedHebrewIssues,
    },
    issuesByReason,
    sectionsWithIssues,
    issues,
  };
}

export function formatDisplayVerificationReport(report: DisplayVerificationReport): string {
  const lines: string[] = [];
  lines.push('paleoMem display verification');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push('');
  lines.push(
    `Scanned ${report.totals.verses} OT verses — English OK: ${report.totals.englishOk}, Hebrew OK: ${report.totals.hebrewOk}`,
  );
  lines.push(
    `Issues — English: ${report.totals.englishIssues} (${report.totals.unexpectedEnglishIssues} unexpected), Hebrew: ${report.totals.hebrewIssues} (${report.totals.unexpectedHebrewIssues} unexpected)`,
  );
  lines.push('');

  if (report.issuesByReason.length === 0) {
    lines.push('All verses render English and Hebrew text.');
    return lines.join('\n');
  }

  lines.push('Issues grouped by reason:');
  lines.push('');

  for (const group of report.issuesByReason) {
    const label = group.expected ? 'expected' : 'ACTION NEEDED';
    lines.push(
      `[${group.side.toUpperCase()}] ${group.reason} (${group.refs.length}) — ${label}`,
    );
    lines.push(`  ${group.description}`);
    const preview = group.refs.slice(0, 12);
    lines.push(`  Refs: ${preview.join(', ')}${group.refs.length > 12 ? ` … +${group.refs.length - 12} more` : ''}`);
    lines.push('');
  }

  if (report.sectionsWithIssues.length > 0) {
    lines.push('Sections with display issues (by chapter):');
    lines.push('');
    for (const section of report.sectionsWithIssues.slice(0, 40)) {
      lines.push(
        `  ${section.section} — English: ${section.englishIssues}, Hebrew: ${section.hebrewIssues} (${section.reasons.join(', ')})`,
      );
      lines.push(`    Examples: ${section.sampleRefs.join(', ')}`);
    }
    if (report.sectionsWithIssues.length > 40) {
      lines.push(`  … +${report.sectionsWithIssues.length - 40} more sections (see JSON report)`);
    }
  }

  return lines.join('\n');
}