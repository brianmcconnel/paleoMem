'use client';

import React from 'react';
import { formatHebrewForDisplay } from '../lib/hebrew-text';
import { useHebrewFont } from './HebrewFontContext';

interface ScriptureHebrewProps {
  text: string;
  className?: string;
  dir?: 'rtl' | 'ltr' | 'auto';
  title?: string;
}

/** Renders Hebrew respecting modern vs Paleo-Hebrew (consonant-only) font mode. */
export function ScriptureHebrew({
  text,
  className,
  dir = 'rtl',
  title,
}: ScriptureHebrewProps) {
  const { font } = useHebrewFont();

  return (
    <span className={className} dir={dir} title={title}>
      {formatHebrewForDisplay(text, font)}
    </span>
  );
}