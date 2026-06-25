'use client';

import { useEffect } from 'react';
import { pwaUrl } from '../lib/pwa';

export function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register(pwaUrl('/sw.js'), {
          scope: pwaUrl('/'),
        });
      } catch (err) {
        console.warn('paleoMem service worker registration failed:', err);
      }
    };

    register();
  }, []);

  return null;
}