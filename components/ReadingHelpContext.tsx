'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { isRtlHelpMinimized, setRtlHelpMinimized } from '../lib/site-cookies';

type ReadingHelpContextValue = {
  ready: boolean;
  minimized: boolean;
  toggleMinimized: () => void;
};

const ReadingHelpContext = createContext<ReadingHelpContextValue>({
  ready: false,
  minimized: false,
  toggleMinimized: () => {},
});

export function ReadingHelpProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const persistMinimized = (next: boolean) => {
    setRtlHelpMinimized(next);
    setMinimized(next);
  };

  useEffect(() => {
    persistMinimized(isRtlHelpMinimized());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    setRtlHelpMinimized(minimized);
  }, [minimized, ready]);

  const toggleMinimized = () => {
    persistMinimized(!minimized);
  };

  return (
    <ReadingHelpContext.Provider value={{ ready, minimized, toggleMinimized }}>
      {children}
    </ReadingHelpContext.Provider>
  );
}

export function useReadingHelp() {
  return useContext(ReadingHelpContext);
}