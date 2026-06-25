'use client';

import { useEffect } from 'react';
import { pwaUrl } from '../lib/pwa';

export function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let removeListeners: (() => void) | undefined;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register(pwaUrl('/sw.js'), {
          scope: pwaUrl('/'),
        });

        const checkForUpdates = () => {
          registration.update().catch(() => {});
        };

        const onVisible = () => {
          if (document.visibilityState === 'visible') checkForUpdates();
        };

        checkForUpdates();
        document.addEventListener('visibilitychange', onVisible);
        window.addEventListener('focus', checkForUpdates);

        removeListeners = () => {
          document.removeEventListener('visibilitychange', onVisible);
          window.removeEventListener('focus', checkForUpdates);
        };
      } catch (err) {
        console.warn('paleoMem service worker registration failed:', err);
      }
    };

    register();

    return () => {
      removeListeners?.();
    };
  }, []);

  return null;
}