'use client';

import React, { useState } from 'react';
import { OT_BOOKS, getBook } from '../data/books';
import { getVerse, getMaxVerse } from '../data/verses';

interface VerseNavigatorProps {
  currentRef: string;
  onSelect: (ref: string) => void;
}

export function VerseNavigator({ currentRef, onSelect }: VerseNavigatorProps) {
  // Parse current ref e.g. "Genesis 1:1"
  const parseRef = (ref: string) => {
    const match = ref.match(/^(.+?)\s+(\d+):(\d+)$/);
    if (match) {
      return { book: match[1], chapter: parseInt(match[2]), verse: parseInt(match[3]) };
    }
    return { book: 'Genesis', chapter: 1, verse: 1 };
  };

  const parsed = parseRef(currentRef);
  const book = parsed.book;
  const chapter = parsed.chapter;
  const verse = parsed.verse;

  const [quickRef, setQuickRef] = useState(currentRef);

  const currentBookInfo = getBook(book) || OT_BOOKS[0];
  const maxChapters = currentBookInfo.chapters;

  const buildRef = (b: string, c: number, v: number) => `${b} ${c}:${v}`;

  const updateSelection = (newBook: string, newChapter: number, newVerse: number) => {
    const ref = buildRef(newBook, newChapter, newVerse);
    setQuickRef(ref);
    onSelect(ref);
  };

  const handleBookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBook = e.target.value;
    updateSelection(newBook, 1, 1);
  };

  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newChapter = parseInt(e.target.value);
    updateSelection(book, newChapter, 1);
  };

  const maxVerse = getMaxVerse(book, chapter);

  const handleVerseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 1;
    const clamped = Math.max(1, Math.min(val, maxVerse));
    updateSelection(book, chapter, clamped);
  };

  const incrementVerse = () => {
    if (verse < maxVerse) {
      updateSelection(book, chapter, verse + 1);
    } else {
      // go to next chapter
      const nextChapter = chapter + 1;
      const bookInfo = getBook(book);
      if (bookInfo && nextChapter <= bookInfo.chapters) {
        updateSelection(book, nextChapter, 1);
      }
    }
  };

  const decrementVerse = () => {
    if (verse > 1) {
      updateSelection(book, chapter, verse - 1);
    } else if (chapter > 1) {
      const prevChapter = chapter - 1;
      const prevMax = getMaxVerse(book, prevChapter);
      updateSelection(book, prevChapter, prevMax);
    } else {
      // prev book last chapter last verse
      const idx = OT_BOOKS.findIndex((b) => b.name === book);
      if (idx > 0) {
        const newBook = OT_BOOKS[idx - 1].name;
        const newChapter = getBook(newBook)!.chapters;
        const newMax = getMaxVerse(newBook, newChapter);
        updateSelection(newBook, newChapter, newMax);
      }
    }
  };

  const incrementChapter = () => {
    const nextChapter = chapter + 1;
    if (nextChapter <= maxChapters) {
      updateSelection(book, nextChapter, 1);
    } else {
      const idx = OT_BOOKS.findIndex((b) => b.name === book);
      if (idx < OT_BOOKS.length - 1) {
        const newBook = OT_BOOKS[idx + 1].name;
        updateSelection(newBook, 1, 1);
      }
    }
  };

  const decrementChapter = () => {
    if (chapter > 1) {
      updateSelection(book, chapter - 1, 1);
    } else {
      const idx = OT_BOOKS.findIndex((b) => b.name === book);
      if (idx > 0) {
        const newBook = OT_BOOKS[idx - 1].name;
        const newChapter = getBook(newBook)!.chapters;
        updateSelection(newBook, newChapter, 1);
      }
    }
  };

  const handlePrev = () => {
    let newVerse = verse - 1;
    let newChapter = chapter;
    let newBook = book;

    if (newVerse < 1) {
      newChapter -= 1;
      if (newChapter < 1) {
        const idx = OT_BOOKS.findIndex((b) => b.name === book);
        if (idx > 0) {
          newBook = OT_BOOKS[idx - 1].name;
          newChapter = getBook(newBook)!.chapters;
        } else {
          return;
        }
      }
      newVerse = getMaxVerse(newBook, newChapter);
    }
    updateSelection(newBook, newChapter, Math.max(1, newVerse));
  };

  const handleNext = () => {
    let newVerse = verse + 1;
    let newChapter = chapter;
    let newBook = book;

    const curMax = getMaxVerse(book, chapter);
    if (newVerse > curMax) {
      newChapter += 1;
      newVerse = 1;
      const bookInfo = getBook(book);
      if (bookInfo && newChapter > bookInfo.chapters) {
        const idx = OT_BOOKS.findIndex((b) => b.name === book);
        if (idx < OT_BOOKS.length - 1) {
          newBook = OT_BOOKS[idx + 1].name;
          newChapter = 1;
        } else {
          return;
        }
      }
    }
    updateSelection(newBook, newChapter, newVerse);
  };

  const goToRef = () => {
    const p = parseRef(quickRef);
    if (p.book && getBook(p.book)) {
      updateSelection(p.book, p.chapter, p.verse);
    } else {
      onSelect(quickRef);
    }
  };

  const currentRefExists = !!getVerse(currentRef);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        {/* Book */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-[var(--pw-text-muted)] mb-1">
            Book
          </label>
          <select
            value={book}
            onChange={handleBookChange}
            className="bg-[var(--pw-bg-surface)] border border-[var(--pw-border)] text-[var(--pw-text)] rounded px-3 py-1.5 text-sm min-w-[160px]"
          >
            {OT_BOOKS.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Chapter */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-[var(--pw-text-muted)] mb-1">
            Chapter
          </label>
          <div className="flex gap-1 items-center">
            <button onClick={decrementChapter} className="btn text-sm px-2">-</button>
            <select
              value={chapter}
              onChange={handleChapterChange}
              className="bg-[var(--pw-bg-surface)] border border-[var(--pw-border)] text-[var(--pw-text)] rounded px-3 py-1.5 text-sm w-20"
            >
              {Array.from({ length: maxChapters }, (_, i) => i + 1).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button onClick={incrementChapter} className="btn text-sm px-2">+</button>
          </div>
        </div>

        {/* Verse */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-[var(--pw-text-muted)] mb-1">
            Verse
          </label>
          <div className="flex gap-1 items-center">
            <button onClick={decrementVerse} className="btn text-sm px-2">-</button>
            <input
              type="number"
              min={1}
              max={maxVerse}
              value={verse}
              onChange={handleVerseChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateSelection(book, chapter, verse);
                }
              }}
              className="bg-[var(--pw-bg-surface)] border border-[var(--pw-border)] text-[var(--pw-text)] rounded px-3 py-1.5 text-sm w-20"
            />
            <button onClick={incrementVerse} className="btn text-sm px-2">+</button>
            <button
              onClick={() => updateSelection(book, chapter, verse)}
              className="btn text-sm px-3"
            >
              Go
            </button>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-2 ml-auto">
          <button onClick={handlePrev} className="btn text-sm px-3">
            ← Prev
          </button>
          <button onClick={handleNext} className="btn text-sm px-3">
            Next →
          </button>
        </div>
      </div>

      {/* Quick reference input */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={quickRef}
          onChange={(e) => setQuickRef(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && goToRef()}
          placeholder="e.g. Genesis 1:1 or Isaiah 53:5"
          className="flex-1 bg-[var(--pw-bg-surface)] border border-[var(--pw-border)] text-[var(--pw-text)] rounded px-3 py-1.5 text-sm font-mono"
        />
        <button onClick={goToRef} className="btn btn-primary text-sm px-4">
          Go to Reference
        </button>
      </div>

      <div className="text-xs text-[var(--pw-text-muted)]">
        Currently viewing: <span className="font-mono text-[var(--pw-accent-gold)]">{currentRef}</span>
      </div>

      <div className="text-[10px] text-[var(--pw-text-faint)]">
        Full Old Testament Hebrew from Open Scriptures Hebrew Bible (OSHB) open source. KJV from public domain open data.
      </div>
    </div>
  );
}
