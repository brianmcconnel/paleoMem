'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { dismissPwaInstall, hasVisitedBefore, isPwaInstallDismissed } from '../lib/site-cookies';
import {
  canShowIosInstallHint,
  isPwaInstalled,
  type PwaInstallPromptEvent,
} from '../lib/pwa-install';

type PromptMode = 'native' | 'ios';

export function PwaInstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<PromptMode>('native');
  const [installing, setInstalling] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<PwaInstallPromptEvent | null>(null);

  const hidePrompt = useCallback((rememberDismissal: boolean) => {
    if (rememberDismissal) dismissPwaInstall();
    setVisible(false);
  }, []);

  useEffect(() => {
    if (isPwaInstalled() || isPwaInstallDismissed()) return;

    const showDelayMs = hasVisitedBefore() ? 1500 : 4500;

    let showTimer: number | undefined;
    let deferred: PwaInstallPromptEvent | null = null;

    const scheduleShow = (nextMode: PromptMode) => {
      window.clearTimeout(showTimer);
      showTimer = window.setTimeout(() => {
        if (isPwaInstalled() || isPwaInstallDismissed()) return;
        setMode(nextMode);
        setVisible(true);
      }, showDelayMs);
    };

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      deferred = event as PwaInstallPromptEvent;
      setDeferredPrompt(deferred);
      scheduleShow('native');
    };

    const onAppInstalled = () => {
      hidePrompt(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    if (canShowIosInstallHint()) {
      scheduleShow('ios');
    }

    return () => {
      window.clearTimeout(showTimer);
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, [hidePrompt]);

  const handleInstall = async () => {
    if (mode === 'ios') {
      hidePrompt(true);
      return;
    }

    if (!deferredPrompt) return;

    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      hidePrompt(choice.outcome === 'accepted' || choice.outcome === 'dismissed');
      if (choice.outcome === 'accepted') setDeferredPrompt(null);
    } catch {
      hidePrompt(false);
    } finally {
      setInstalling(false);
    }
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-desc"
      className="fixed top-12 left-0 right-0 z-40 px-4 sm:px-6 pointer-events-none"
    >
      <div className="pointer-events-auto max-w-6xl mx-auto mt-3 rounded-xl border border-[var(--pw-accent-gold)]/40 bg-[var(--pw-bg-panel)] shadow-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-[var(--pw-accent-gold)] text-[var(--pw-on-gold)] flex items-center justify-center font-bold text-xl shrink-0 scripture-hebrew leading-none">
            מ
          </div>
          <div className="min-w-0">
            <div id="pwa-install-title" className="font-semibold text-[var(--pw-text)]">
              Install paleoMem
            </div>
            <p id="pwa-install-desc" className="text-sm text-[var(--pw-text-muted)] mt-0.5 leading-snug">
              {mode === 'ios' ? (
                <>
                  Tap <span className="font-medium text-[var(--pw-text-soft)]">Share</span> in Safari,
                  then <span className="font-medium text-[var(--pw-text-soft)]">Add to Home Screen</span>{' '}
                  for quick access and offline reading.
                </>
              ) : (
                'Add paleoMem to your home screen for quick access and offline reading.'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
          <button
            type="button"
            onClick={() => hidePrompt(true)}
            className="btn text-sm px-3 py-2"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={handleInstall}
            disabled={installing || (mode === 'native' && !deferredPrompt)}
            className="btn btn-gold text-sm px-4 py-2 disabled:opacity-60"
          >
            {installing ? 'Installing…' : mode === 'ios' ? 'Got it' : 'Install'}
          </button>
        </div>
      </div>
    </div>
  );
}