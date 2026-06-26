const LAST_KOINE_VERSE_COOKIE = 'paleomem_last_koine_verse';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function cookiePath(): string {
  if (typeof window === 'undefined') return '/';
  return window.location.pathname.startsWith('/paleoMem') ? '/paleoMem' : '/';
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const prefix = `${name}=`;
  const entry = document.cookie.split(';').find((c) => c.trim().startsWith(prefix));
  if (!entry) return null;
  return decodeURIComponent(entry.trim().slice(prefix.length));
}

function setCookie(name: string, value: string): void {
  if (typeof document === 'undefined') return;
  const path = cookiePath();
  document.cookie = `${name}=${encodeURIComponent(value)}; path=${path}; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function getLastKoineVerse(): string | null {
  return getCookie(LAST_KOINE_VERSE_COOKIE);
}

export function setLastKoineVerse(ref: string): void {
  setCookie(LAST_KOINE_VERSE_COOKIE, ref);
}