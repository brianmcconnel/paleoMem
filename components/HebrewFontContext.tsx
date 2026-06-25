'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getHebrewFont, setHebrewFont, type HebrewFontMode } from '../lib/site-cookies';

type HebrewFontContextValue = {
  ready: boolean;
  font: HebrewFontMode;
  setFontMode: (font: HebrewFontMode) => void;
  toggleFont: () => void;
};

const HebrewFontContext = createContext<HebrewFontContextValue>({
  ready: false,
  font: 'modern',
  setFontMode: () => {},
  toggleFont: () => {},
});

function applyHebrewFont(font: HebrewFontMode) {
  document.documentElement.setAttribute('data-hebrew-font', font);
}

export function HebrewFontProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [font, setFontState] = useState<HebrewFontMode>('modern');

  useEffect(() => {
    const saved = getHebrewFont();
    setFontState(saved);
    applyHebrewFont(saved);
    setReady(true);
  }, []);

  const setFontMode = (next: HebrewFontMode) => {
    setHebrewFont(next);
    setFontState(next);
    applyHebrewFont(next);
  };

  const toggleFont = () => {
    setFontMode(font === 'modern' ? 'paleo' : 'modern');
  };

  return (
    <HebrewFontContext.Provider value={{ ready, font, setFontMode, toggleFont }}>
      {children}
    </HebrewFontContext.Provider>
  );
}

export function useHebrewFont() {
  return useContext(HebrewFontContext);
}