'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getNtRedLetter,
  getShowEmojis,
  getVerseOnVisit,
  setNtRedLetter,
  setShowEmojis,
  setVerseOnVisit,
  type VerseOnVisitMode,
} from '../lib/site-cookies';

type UserSettingsContextValue = {
  ready: boolean;
  showEmojis: boolean;
  setShowEmojisEnabled: (show: boolean) => void;
  ntRedLetter: boolean;
  setNtRedLetterEnabled: (enabled: boolean) => void;
  verseOnVisit: VerseOnVisitMode;
  setVerseOnVisitMode: (mode: VerseOnVisitMode) => void;
};

const UserSettingsContext = createContext<UserSettingsContextValue>({
  ready: false,
  showEmojis: true,
  setShowEmojisEnabled: () => {},
  ntRedLetter: false,
  setNtRedLetterEnabled: () => {},
  verseOnVisit: 'last',
  setVerseOnVisitMode: () => {},
});

export function UserSettingsProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [showEmojis, setShowEmojisState] = useState(true);
  const [ntRedLetter, setNtRedLetterState] = useState(false);
  const [verseOnVisit, setVerseOnVisitState] = useState<VerseOnVisitMode>('last');

  useEffect(() => {
    setShowEmojisState(getShowEmojis());
    setNtRedLetterState(getNtRedLetter());
    setVerseOnVisitState(getVerseOnVisit());
    setReady(true);
  }, []);

  const setShowEmojisEnabled = (show: boolean) => {
    setShowEmojis(show);
    setShowEmojisState(show);
  };

  const setNtRedLetterEnabled = (enabled: boolean) => {
    setNtRedLetter(enabled);
    setNtRedLetterState(enabled);
  };

  const setVerseOnVisitMode = (mode: VerseOnVisitMode) => {
    setVerseOnVisit(mode);
    setVerseOnVisitState(mode);
  };

  return (
    <UserSettingsContext.Provider
      value={{
        ready,
        showEmojis,
        setShowEmojisEnabled,
        ntRedLetter,
        setNtRedLetterEnabled,
        verseOnVisit,
        setVerseOnVisitMode,
      }}
    >
      {children}
    </UserSettingsContext.Provider>
  );
}

export function useUserSettings() {
  return useContext(UserSettingsContext);
}