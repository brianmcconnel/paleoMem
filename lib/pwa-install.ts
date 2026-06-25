/** Deferred install prompt from beforeinstallprompt (Chromium). */
export type PwaInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function isPwaInstalled(): boolean {
  if (typeof window === 'undefined') return false;

  const standaloneQuery = window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;

  return standaloneQuery || iosStandalone;
}

export function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false;

  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function canShowIosInstallHint(): boolean {
  return isIosDevice() && !isPwaInstalled();
}