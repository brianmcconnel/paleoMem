'use client';

import React from 'react';

export function VerseNumberingNote({ hebrewSourceRef }: { hebrewSourceRef: string }) {
  return (
    <p
      className="text-[10px] text-[var(--pw-text-faint)] leading-snug border-t border-[var(--pw-border)]/70 pt-2 mt-2"
      role="note"
    >
      Hebrew text from OSHB {hebrewSourceRef} (KJV numbering differs in this chapter).
    </p>
  );
}