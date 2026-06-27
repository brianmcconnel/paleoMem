const VISITED_COOKIE = 'paleomem_visited';
const KOINE_VISITED_COOKIE = 'paleomem_koine_visited';
const VAV_VISITED_COOKIE = 'paleomem_vav_visited';
const LAST_VERSE_COOKIE = 'paleomem_last_verse';
const RTL_HELP_MINIMIZED_COOKIE = 'paleomem_rtl_help_minimized';
const THEME_COOKIE = 'paleomem_theme';
const HEBREW_FONT_COOKIE = 'paleomem_hebrew_font';
const PWA_INSTALL_DISMISSED_COOKIE = 'paleomem_pwa_install_dismissed';
const SHOW_EMOJIS_COOKIE = 'paleomem_show_emojis';
const VERSE_ON_VISIT_COOKIE = 'paleomem_verse_on_visit';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

export type ThemeMode = 'dark' | 'light';
export type HebrewFontMode = 'modern' | 'paleo';
export type VerseOnVisitMode = 'last' | 'random';

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

export function hasKoineVisitedBefore(): boolean {
  return getCookie(KOINE_VISITED_COOKIE) != null;
}

export function markKoineVisited(): void {
  setCookie(KOINE_VISITED_COOKIE, '1');
}

export function hasVavVisitedBefore(): boolean {
  return getCookie(VAV_VISITED_COOKIE) != null;
}

export function markVavVisited(): void {
  setCookie(VAV_VISITED_COOKIE, '1');
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

/** Color theme preference — defaults to dark when unset. */
export function getTheme(): ThemeMode {
  return getCookie(THEME_COOKIE) === 'light' ? 'light' : 'dark';
}

export function setTheme(theme: ThemeMode): void {
  setCookie(THEME_COOKIE, theme);
}

/** Hebrew script font — defaults to modern pointed Hebrew (Noto). */
export function getHebrewFont(): HebrewFontMode {
  return getCookie(HEBREW_FONT_COOKIE) === 'paleo' ? 'paleo' : 'modern';
}

export function setHebrewFont(font: HebrewFontMode): void {
  setCookie(HEBREW_FONT_COOKIE, font);
}

/** User dismissed the install prompt — do not show again for cookie lifetime. */
export function isPwaInstallDismissed(): boolean {
  return getCookie(PWA_INSTALL_DISMISSED_COOKIE) === '1';
}

export function dismissPwaInstall(): void {
  setCookie(PWA_INSTALL_DISMISSED_COOKIE, '1');
}

/** Show pictograph emojis in interlinear letter cards — defaults to on. */
export function getShowEmojis(): boolean {
  const value = getCookie(SHOW_EMOJIS_COOKIE);
  if (value === '0') return false;
  return true;
}

export function setShowEmojis(show: boolean): void {
  setCookie(SHOW_EMOJIS_COOKIE, show ? '1' : '0');
}

/** Which verse to open on a fresh visit — resume last or pick at random. */
export function getVerseOnVisit(): VerseOnVisitMode {
  return getCookie(VERSE_ON_VISIT_COOKIE) === 'random' ? 'random' : 'last';
}

export function setVerseOnVisit(mode: VerseOnVisitMode): void {
  setCookie(VERSE_ON_VISIT_COOKIE, mode);
}

/** Inline script: apply saved theme and Hebrew font before first paint (attributes only — no inline styles). */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var c=document.cookie;var tm=c.match(/(?:^|;\\s*)paleomem_theme=([^;]*)/);var t=tm?decodeURIComponent(tm[1]):'dark';var theme=t==='light'?'light':'dark';var root=document.documentElement;root.setAttribute('data-theme',theme);var color=theme==='light'?'#ffffff':'#0b1118';document.querySelectorAll('meta[name="theme-color"]').forEach(function(m){if(m.getAttribute('media'))m.remove();});var tc=document.querySelector('meta[name="theme-color"]');if(!tc){tc=document.createElement('meta');tc.name='theme-color';document.head.appendChild(tc);}tc.content=color;var fm=c.match(/(?:^|;\\s*)paleomem_hebrew_font=([^;]*)/);var f=fm?decodeURIComponent(fm[1]):'modern';root.setAttribute('data-hebrew-font',f==='paleo'?'paleo':'modern');}catch(e){}})();`;