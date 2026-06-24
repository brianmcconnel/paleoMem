'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  OT_BOOKS,
  getBook,
  parseRef,
  buildRef,
  getNextReference,
  getPrevReference,
  normalizeReference,
} from '../data/books';
import { getMaxVerse } from '../data/verses';

interface VerseNavigatorProps {
  currentRef: string;
  onSelect: (ref: string) => void;
}

export function VerseNavigator({ currentRef, onSelect }: VerseNavigatorProps) {
  const { book: activeBook, chapter: activeChapter, verse: activeVerse } = parseRef(currentRef);

  const [isExpanded, setIsExpanded] = useState(false);
  const [pickerBook, setPickerBook] = useState(activeBook);
  const [pickerChapter, setPickerChapter] = useState(activeChapter);
  const [pickerVerse, setPickerVerse] = useState(activeVerse);
  const [quickRef, setQuickRef] = useState(currentRef);
  const [isEditingRef, setIsEditingRef] = useState(false);

  const selectedBookRef = useRef<HTMLButtonElement>(null);
  const selectedChapterRef = useRef<HTMLButtonElement>(null);
  const selectedVerseRef = useRef<HTMLButtonElement>(null);

  const closePanel = () => setIsExpanded(false);

  const openPanel = () => {
    const parsed = parseRef(currentRef);
    setPickerBook(parsed.book);
    setPickerChapter(parsed.chapter);
    setPickerVerse(parsed.verse);
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
  }, [isExpanded, pickerBook, pickerChapter, pickerVerse]);

  useEffect(() => {
    const collapse = () => closePanel();
    window.addEventListener('paleomem:collapse-picker', collapse);
    return () => window.removeEventListener('paleomem:collapse-picker', collapse);
  }, []);

  const maxChapters = getBook(pickerBook)?.chapters ?? 1;
  const maxVerse = getMaxVerse(pickerBook, pickerChapter);

  const prevRef = getPrevReference(activeBook, activeChapter, activeVerse);
  const nextRef = getNextReference(activeBook, activeChapter, activeVerse);

  const commitRef = (ref: string) => {
    closePanel();
    onSelect(ref);
  };

  const selectBook = (book: string) => {
    setPickerBook(book);
    setPickerChapter(1);
    setPickerVerse(1);
  };

  const selectChapter = (chapter: number) => {
    setPickerChapter(chapter);
    setPickerVerse(1);
  };

  const selectVerse = (verse: number) => {
    commitRef(buildRef(pickerBook, pickerChapter, verse));
  };

  const goToRef = () => {
    commitRef(normalizeReference(quickRef));
  };

  const pickerItemClass = (selected: boolean) =>
    selected
      ? 'bg-[var(--pw-accent-gold)] text-[var(--pw-on-gold)] font-medium'
      : 'text-[var(--pw-text-soft)] hover:bg-[var(--pw-bg-elevated)]';

  return (
    <div className="w-full space-y-2">
      {/* Compact bar: prev / reference / next */}
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
          aria-label="Open bible selection"
        >
          <span className="font-mono tracking-tight">{currentRef}</span>
          <span className="text-[var(--pw-accent-gold)] text-[10px] select-none">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[var(--pw-text-muted)] mb-1">
                Books
              </div>
              <div className="overflow-y-auto max-h-44 flex flex-col gap-0.5 pr-1">
                {OT_BOOKS.map((b) => (
                  <button
                    key={b.name}
                    type="button"
                    ref={pickerBook === b.name ? selectedBookRef : undefined}
                    onClick={() => selectBook(b.name)}
                    className={`px-2 py-1 rounded cursor-pointer select-none text-sm text-left ${pickerItemClass(pickerBook === b.name)}`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-widest text-[var(--pw-text-muted)] mb-1">
                Chapters
              </div>
              <div className="overflow-y-auto max-h-44 grid grid-cols-5 gap-1 text-center pr-1">
                {Array.from({ length: maxChapters }, (_, i) => i + 1).map((c) => (
                  <button
                    key={c}
                    type="button"
                    ref={pickerChapter === c ? selectedChapterRef : undefined}
                    onClick={() => selectChapter(c)}
                    className={`py-1 text-xs rounded cursor-pointer select-none ${pickerItemClass(pickerChapter === c)}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-widest text-[var(--pw-text-muted)] mb-1">
                Verses
              </div>
              <div className="overflow-y-auto max-h-44 grid grid-cols-6 gap-1 text-center pr-1">
                {Array.from({ length: maxVerse }, (_, i) => i + 1).map((v) => (
                  <button
                    key={v}
                    type="button"
                    ref={pickerVerse === v ? selectedVerseRef : undefined}
                    onClick={() => selectVerse(v)}
                    className={`py-1 text-xs rounded cursor-pointer select-none ${pickerItemClass(pickerVerse === v)}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

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
              placeholder="e.g. Isaiah 53:5"
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