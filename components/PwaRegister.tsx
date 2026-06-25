'use client';

import { useEffect } from 'react';
import { pwaUrl } from '../lib/pwa';

export function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register(pwaUrl('/sw.js'), {
          scope: pwaUrl('/'),
        });

        const checkForUpdates = () => {
          registration.update().catch(() => {});
        };

        checkForUpdates();
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') checkForUpdates();
        });
      } catch (err) {
        console.warn('paleoMem service worker registration failed:', err);
      }
    };

    register();
  }, []);

  return null;
}