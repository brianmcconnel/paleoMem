'use client';

import React from 'react';
import { SAMPLE_VERSES } from '../data/verses';

interface VersePickerProps {
  currentRef: string;
  onSelect: (ref: string) => void;
}

export function VersePicker({ currentRef, onSelect }: VersePickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {SAMPLE_VERSES.map(v => (
        <button
          key={v.ref}
          onClick={() => onSelect(v.ref)}
          className={`btn text-sm px-3 py-1.5 ${currentRef === v.ref ? 'btn-gold' : ''}`}
          aria-current={currentRef === v.ref ? 'page' : undefined}
        >
          {v.ref}
        </button>
      ))}
      <span className="text-[var(--pw-text-muted)] text-xs self-center ml-2">
        (MVP — more verses coming)
      </span>
    </div>
  );
}
