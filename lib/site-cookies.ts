const VISITED_COOKIE = 'paleomem_visited';
const LAST_VERSE_COOKIE = 'paleomem_last_verse';
const RTL_HELP_MINIMIZED_COOKIE = 'paleomem_rtl_help_minimized';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

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

export function hasVisitedBefore(): boolean {
  return getCookie(VISITED_COOKIE) != null;
}

export function markVisited(): void {
  setCookie(VISITED_COOKIE, '1');
}

export function getLastVerse(): string | null {
  return getCookie(LAST_VERSE_COOKIE);
}

export function setLastVerse(ref: string): void {
  setCookie(LAST_VERSE_COOKIE, ref);
}

/** Whether Hebrew reading help is collapsed (stored in paleomem_rtl_help_minimized). */
export function isRtlHelpMinimized(): boolean {
  return getCookie(RTL_HELP_MINIMIZED_COOKIE) === '1';
}

export function setRtlHelpMinimized(minimized: boolean): void {
  setCookie(RTL_HELP_MINIMIZED_COOKIE, minimized ? '1' : '0');
}