'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getTheme, setTheme, type ThemeMode } from '../lib/site-cookies';

type ThemeContextValue = {
  ready: boolean;
  theme: ThemeMode;
  setThemeMode: (theme: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  ready: false,
  theme: 'dark',
  setThemeMode: () => {},
  toggleTheme: () => {},
});

function applyTheme(theme: ThemeMode) {
  document.documentElement.setAttribute('data-theme', theme);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [theme, setThemeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    const saved = getTheme();
    setThemeState(saved);
    applyTheme(saved);
    setReady(true);
  }, []);

  const setThemeMode = (next: ThemeMode) => {
    setTheme(next);
    setThemeState(next);
    applyTheme(next);
  };

  const toggleTheme = () => {
    setThemeMode(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ ready, theme, setThemeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}