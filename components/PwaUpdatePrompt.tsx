'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  clearUpdatePromptDismissal,
  dismissUpdatePrompt,
  hadServiceWorkerController,
  isUpdatePromptDismissed,
} from '../lib/pwa-update';

export function PwaUpdatePrompt() {
  const [visible, setVisible] = useState(false);

  const showUpdate = useCallback(() => {
    if (isUpdatePromptDismissed()) return;
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const hadController = hadServiceWorkerController();

    const watchWorker = (worker: ServiceWorker) => {
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          showUpdate();
        }
      });
    };

    const onControllerChange = () => {
      if (hadController) showUpdate();
    };

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    navigator.serviceWorker.ready
      .then((registration) => {
        if (registration.waiting && hadController) {
          showUpdate();
        }

        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if (worker) watchWorker(worker);
        });
      })
      .catch(() => {});

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, [showUpdate]);

  const handleRefresh = () => {
    clearUpdatePromptDismissal();
    window.location.reload();
  };

  const handleLater = () => {
    dismissUpdatePrompt();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="pwa-update-title"
      aria-describedby="pwa-update-desc"
      className="fixed top-12 left-0 right-0 z-[45] px-4 sm:px-6 pointer-events-none"
    >
      <div className="pointer-events-auto max-w-6xl mx-auto mt-3 rounded-xl border border-[var(--pw-accent)]/50 bg-[var(--pw-bg-panel)] shadow-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <div id="pwa-update-title" className="font-semibold text-[var(--pw-text)]">
            Update available
          </div>
          <p id="pwa-update-desc" className="text-sm text-[var(--pw-text-muted)] mt-0.5 leading-snug">
            A new version of paleoMem is ready. Refresh to load the latest fixes and features.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
          <button type="button" onClick={handleLater} className="btn text-sm px-3 py-2">
            Later
          </button>
          <button type="button" onClick={handleRefresh} className="btn btn-primary text-sm px-4 py-2">
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}