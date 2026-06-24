const COOKIE_NAME = 'paleomem_visited';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

function cookiePath(): string {
  if (typeof window === 'undefined') return '/';
  return window.location.pathname.startsWith('/paleoMem') ? '/paleoMem' : '/';
}

export function hasVisitedBefore(): boolean {
  if (typeof document === 'undefined') return false;

  return document.cookie
    .split(';')
    .some((entry) => entry.trim().startsWith(`${COOKIE_NAME}=`));
}

export function markVisited(): void {
  if (typeof document === 'undefined') return;

  const path = cookiePath();
  document.cookie = `${COOKIE_NAME}=1; path=${path}; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}