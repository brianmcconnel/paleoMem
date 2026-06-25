const UPDATE_DISMISSED_KEY = 'paleomem_update_dismissed';

export function isUpdatePromptDismissed(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem(UPDATE_DISMISSED_KEY) === '1';
}

export function dismissUpdatePrompt(): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(UPDATE_DISMISSED_KEY, '1');
}

export function clearUpdatePromptDismissal(): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(UPDATE_DISMISSED_KEY);
}

/** True when a service worker already controls the page (not first-ever install). */
export function hadServiceWorkerController(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.serviceWorker?.controller;
}