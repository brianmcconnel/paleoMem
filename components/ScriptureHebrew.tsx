'use client';

import React from 'react';
import { formatHebrewForDisplay } from '../lib/hebrew-text';
import { useHebrewFont } from './HebrewFontContext';

interface ScriptureHebrewProps {
  text: string;
  script?: 'hebrew' | 'aramaic';
  className?: string;
  dir?: 'rtl' | 'ltr' | 'auto';
  title?: string;
}

/** Renders Hebrew respecting modern vs Paleo-Hebrew (consonant-only) font mode. */
export function ScriptureHebrew({
  text,
  script = 'hebrew',
  className,
  dir = 'rtl',
  title,
}: ScriptureHebrewProps) {
  const { font } = useHebrewFont();
  const scriptClass =
    script === 'aramaic' ? 'scripture-aramaic text-[var(--pw-aramaic)]' : undefined;

  return (
    <span className={[className, scriptClass].filter(Boolean).join(' ')} dir={dir} title={title}>
      {formatHebrewForDisplay(text, font)}
    </span>
  );
}