'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getShowEmojis,
  getVerseOnVisit,
  setShowEmojis,
  setVerseOnVisit,
  type VerseOnVisitMode,
} from '../lib/site-cookies';

type UserSettingsContextValue = {
  ready: boolean;
  showEmojis: boolean;
  setShowEmojisEnabled: (show: boolean) => void;
  verseOnVisit: VerseOnVisitMode;
  setVerseOnVisitMode: (mode: VerseOnVisitMode) => void;
};

const UserSettingsContext = createContext<UserSettingsContextValue>({
  ready: false,
  showEmojis: true,
  setShowEmojisEnabled: () => {},
  verseOnVisit: 'last',
  setVerseOnVisitMode: () => {},
});

export function UserSettingsProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [showEmojis, setShowEmojisState] = useState(true);
  const [verseOnVisit, setVerseOnVisitState] = useState<VerseOnVisitMode>('last');

  useEffect(() => {
    setShowEmojisState(getShowEmojis());
    setVerseOnVisitState(getVerseOnVisit());
    setReady(true);
  }, []);

  const setShowEmojisEnabled = (show: boolean) => {
    setShowEmojis(show);
    setShowEmojisState(show);
  };

  const setVerseOnVisitMode = (mode: VerseOnVisitMode) => {
    setVerseOnVisit(mode);
    setVerseOnVisitState(mode);
  };

  return (
    <UserSettingsContext.Provider
      value={{ ready, showEmojis, setShowEmojisEnabled, verseOnVisit, setVerseOnVisitMode }}
    >
      {children}
    </UserSettingsContext.Provider>
  );
}

export function useUserSettings() {
  return useContext(UserSettingsContext);
}