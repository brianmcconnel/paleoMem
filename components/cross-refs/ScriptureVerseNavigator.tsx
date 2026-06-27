'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  OT_BOOKS,
  buildRef,
  getBook,
  getNextReference,
  getPrevReference,
  normalizeReference,
  parseRef,
} from '../../data/books';
import {
  NT_BOOKS,
  getNtBook,
  getNtMaxVerse,
  getNextNtReference,
  getPrevNtReference,
  normalizeNtReference,
} from '../../data/nt-books';
import { getMaxVerse } from '../../data/verses';
import { isNewTestamentVid, refToVid } from '../../lib/verse-id';

type Testament = 'ot' | 'nt';
type PickerStep = 'book' | 'chapter' | 'verse';

interface ScriptureVerseNavigatorProps {
  currentRef: string;
  onSelect: (ref: string) => void;
}

function testamentForRef(ref: string): Testament {
  const vid = refToVid(ref);
  if (vid == null) return 'ot';
  return isNewTestamentVid(vid) ? 'nt' : 'ot';
}

function normalizeBibleRef(ref: string): string {
  const parsed = parseRef(ref.trim());
  if (getNtBook(parsed.book)) return normalizeNtReference(ref);
  if (getBook(parsed.book)) return normalizeReference(ref);
  return ref.trim();
}

function getNextBibleRef(book: string, chapter: number, verse: number) {
  if (getBook(book)) {
    const next = getNextReference(book, chapter, verse);
    if (next) return next;
    return { book: NT_BOOKS[0].name, chapter: 1, verse: 1 };
  }
  return getNextNtReference(book, chapter, verse);
}

function getPrevBibleRef(book: string, chapter: number, verse: number) {
  if (getNtBook(book)) {
    const prev = getPrevNtReference(book, chapter, verse);
    if (prev) return prev;
    const lastOt = OT_BOOKS[OT_BOOKS.length - 1];
    const chapterNum = lastOt.chapters;
    return {
      book: lastOt.name,
      chapter: chapterNum,
      verse: getMaxVerse(lastOt.name, chapterNum),
    };
  }
  return getPrevReference(book, chapter, verse);
}

export function ScriptureVerseNavigator({ currentRef, onSelect }: ScriptureVerseNavigatorProps) {
  const { book: activeBook, chapter: activeChapter, verse: activeVerse } = parseRef(currentRef);
  const activeTestament = testamentForRef(currentRef);

  const [isExpanded, setIsExpanded] = useState(false);
  const [testament, setTestament] = useState<Testament>(activeTestament);
  const [pickerStep, setPickerStep] = useState<PickerStep>('book');
  const [pickerBook, setPickerBook] = useState(activeBook);
  const [pickerChapter, setPickerChapter] = useState(activeChapter);
  const [pickerVerse, setPickerVerse] = useState(activeVerse);
  const [quickRef, setQuickRef] = useState(currentRef);
  const [isEditingRef, setIsEditingRef] = useState(false);

  const selectedBookRef = useRef<HTMLButtonElement>(null);
  const selectedChapterRef = useRef<HTMLButtonElement>(null);
  const selectedVerseRef = useRef<HTMLButtonElement>(null);

  const accentVar = activeTestament === 'nt' ? 'var(--pw-accent)' : 'var(--pw-accent-gold)';
  const books = testament === 'nt' ? NT_BOOKS : OT_BOOKS;
  const maxChapters =
    testament === 'nt'
      ? (getNtBook(pickerBook)?.chapters ?? 1)
      : (getBook(pickerBook)?.chapters ?? 1);
  const maxVerse =
    testament === 'nt'
      ? getNtMaxVerse(pickerBook, pickerChapter)
      : getMaxVerse(pickerBook, pickerChapter);

  const prevRef = getPrevBibleRef(activeBook, activeChapter, activeVerse);
  const nextRef = getNextBibleRef(activeBook, activeChapter, activeVerse);

  const closePanel = () => setIsExpanded(false);

  const openPanel = () => {
    const parsed = parseRef(currentRef);
    const nextTestament = testamentForRef(currentRef);
    setTestament(nextTestament);
    setPickerBook(parsed.book);
    setPickerChapter(parsed.chapter);
    setPickerVerse(parsed.verse);
    setPickerStep('book');
    setQuickRef(currentRef);
    setIsEditingRef(false);
    setIsExpanded(true);
  };

  const toggleExpanded = () => {
    if (isExpanded) closePanel();
    else openPanel();
  };

  useEffect(() => {
    if (!isExpanded) return;
    selectedBookRef.current?.scrollIntoView({ block: 'nearest' });
    selectedChapterRef.current?.scrollIntoView({ block: 'nearest' });
    selectedVerseRef.current?.scrollIntoView({ block: 'nearest' });
  }, [isExpanded, pickerStep, pickerBook, pickerChapter, pickerVerse, testament]);

  useEffect(() => {
    const collapse = () => closePanel();
    window.addEventListener('paleomem:collapse-picker', collapse);
    return () => window.removeEventListener('paleomem:collapse-picker', collapse);
  }, []);

  const commitRef = (ref: string) => {
    closePanel();
    onSelect(normalizeBibleRef(ref));
  };

  const switchTestament = (next: Testament) => {
    setTestament(next);
    setPickerStep('book');
    const firstBook = next === 'nt' ? NT_BOOKS[0].name : OT_BOOKS[0].name;
    setPickerBook(firstBook);
    setPickerChapter(1);
    setPickerVerse(1);
  };

  const selectBook = (book: string) => {
    setPickerBook(book);
    setPickerChapter(1);
    setPickerVerse(1);
    setPickerStep('chapter');
  };

  const selectChapter = (chapter: number) => {
    setPickerChapter(chapter);
    setPickerVerse(1);
    setPickerStep('verse');
  };

  const selectVerse = (verse: number) => {
    commitRef(buildRef(pickerBook, pickerChapter, verse));
  };

  const goToRef = () => {
    commitRef(quickRef);
  };

  const pickerItemClass = (selected: boolean) =>
    selected
      ? 'font-medium'
      : 'text-[var(--pw-text-soft)] hover:bg-[var(--pw-bg-elevated)]';

  const pickerItemStyle = (selected: boolean): React.CSSProperties | undefined =>
    selected
      ? {
          backgroundColor: testament === 'nt' ? 'var(--pw-accent)' : 'var(--pw-accent-gold)',
          color: testament === 'nt' ? 'var(--pw-bg-app)' : 'var(--pw-on-gold)',
        }
      : undefined;

  const stepTitle =
    pickerStep === 'book'
      ? `Choose a ${testament === 'nt' ? 'New' : 'Old'} Testament book`
      : pickerStep === 'chapter'
        ? `${pickerBook} — choose a chapter`
        : `${pickerBook} ${pickerChapter} — choose a verse`;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => prevRef && onSelect(buildRef(prevRef.book, prevRef.chapter, prevRef.verse))}
          disabled={!prevRef}
          className="btn text-sm px-2.5 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous verse"
        >
          ←
        </button>

        <button
          type="button"
          onClick={toggleExpanded}
          className="flex-1 flex items-center justify-between bg-[var(--pw-bg-surface)] border border-[var(--pw-border)] rounded-md px-3 py-1.5 text-sm font-medium text-[var(--pw-text)] hover:bg-[var(--pw-bg-elevated)] transition-colors"
          aria-expanded={isExpanded}
          aria-label="Open scripture selection"
        >
          <span className="font-mono tracking-tight" style={{ color: accentVar }}>
            {currentRef}
          </span>
          <span className="text-[10px] select-none" style={{ color: accentVar }}>
            {isExpanded ? '−' : '+'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => nextRef && onSelect(buildRef(nextRef.book, nextRef.chapter, nextRef.verse))}
          disabled={!nextRef}
          className="btn text-sm px-2.5 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next verse"
        >
          →
        </button>
      </div>

      {isExpanded && (
        <div className="p-3 bg-[var(--pw-bg-surface)] border border-[var(--pw-border)] rounded-md text-xs space-y-3">
          <div className="flex gap-1 p-0.5 rounded-lg bg-[var(--pw-bg-elevated)] border border-[var(--pw-border)]">
            <button
              type="button"
              onClick={() => switchTestament('ot')}
              className={`flex-1 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wide transition-colors ${
                testament === 'ot' ? '' : 'text-[var(--pw-text-muted)] hover:text-[var(--pw-text-soft)]'
              }`}
              style={
                testament === 'ot'
                  ? { backgroundColor: 'var(--pw-accent-gold)', color: 'var(--pw-on-gold)' }
                  : undefined
              }
            >
              Old Testament
            </button>
            <button
              type="button"
              onClick={() => switchTestament('nt')}
              className={`flex-1 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wide transition-colors ${
                testament === 'nt' ? '' : 'text-[var(--pw-text-muted)] hover:text-[var(--pw-text-soft)]'
              }`}
              style={
                testament === 'nt'
                  ? { backgroundColor: 'var(--pw-accent)', color: 'var(--pw-bg-app)' }
                  : undefined
              }
            >
              New Testament
            </button>
          </div>

          <div className="flex items-center gap-2">
            {pickerStep !== 'book' && (
              <button
                type="button"
                onClick={() => setPickerStep(pickerStep === 'verse' ? 'chapter' : 'book')}
                className="btn text-xs px-2 py-1 shrink-0"
                aria-label="Go back one step"
              >
                ← Back
              </button>
            )}
            <div className="text-[10px] uppercase tracking-widest text-[var(--pw-text-muted)] flex-1">
              {stepTitle}
            </div>
          </div>

          {pickerStep === 'book' && (
            <div className="overflow-y-auto max-h-52 flex flex-col gap-0.5 pr-1">
              {books.map((b) => (
                <button
                  key={b.name}
                  type="button"
                  ref={pickerBook === b.name ? selectedBookRef : undefined}
                  onClick={() => selectBook(b.name)}
                  className={`px-2 py-1.5 rounded cursor-pointer select-none text-sm text-left ${pickerItemClass(pickerBook === b.name)}`}
                  style={pickerItemStyle(pickerBook === b.name)}
                >
                  {b.name}
                </button>
              ))}
            </div>
          )}

          {pickerStep === 'chapter' && (
            <div className="overflow-y-auto max-h-52 grid grid-cols-6 sm:grid-cols-8 gap-1 text-center pr-1">
              {Array.from({ length: maxChapters }, (_, i) => i + 1).map((c) => (
                <button
                  key={c}
                  type="button"
                  ref={pickerChapter === c ? selectedChapterRef : undefined}
                  onClick={() => selectChapter(c)}
                  className={`py-1.5 text-xs rounded cursor-pointer select-none ${pickerItemClass(pickerChapter === c)}`}
                  style={pickerItemStyle(pickerChapter === c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {pickerStep === 'verse' && (
            <div className="overflow-y-auto max-h-52 grid grid-cols-6 sm:grid-cols-8 gap-1 text-center pr-1">
              {Array.from({ length: maxVerse }, (_, i) => i + 1).map((v) => (
                <button
                  key={v}
                  type="button"
                  ref={pickerVerse === v ? selectedVerseRef : undefined}
                  onClick={() => selectVerse(v)}
                  className={`py-1.5 text-xs rounded cursor-pointer select-none ${pickerItemClass(pickerVerse === v)}`}
                  style={pickerItemStyle(pickerVerse === v)}
                >
                  {v}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 items-center pt-1 border-t border-[var(--pw-border)]">
            <input
              type="text"
              value={isEditingRef ? quickRef : currentRef}
              onFocus={() => {
                setIsEditingRef(true);
                setQuickRef(currentRef);
              }}
              onBlur={() => setIsEditingRef(false)}
              onChange={(e) => setQuickRef(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && goToRef()}
              placeholder="e.g. Genesis 1:1 or John 1:1"
              className="flex-1 bg-[var(--pw-bg-elevated)] border border-[var(--pw-border)] text-[var(--pw-text)] rounded px-3 py-1.5 text-sm font-mono"
            />
            <button type="button" onClick={goToRef} className="btn btn-primary text-sm px-4 shrink-0">
              Go
            </button>
          </div>
        </div>
      )}
    </div>
  );
}