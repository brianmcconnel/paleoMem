import type { ThemeMode } from './site-cookies';

export const THEME_COLORS: Record<ThemeMode, string> = {
  dark: '#0b1118',
  light: '#ffffff',
};

/** Apply theme to the document (data-theme + mobile browser chrome; backgrounds via CSS). */
export function applyThemeToDocument(theme: ThemeMode): void {
  const root = document.documentElement;
  const bg = THEME_COLORS[theme];

  root.setAttribute('data-theme', theme);

  // Next.js may emit prefers-color-scheme theme-color tags — remove so app choice wins on mobile.
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
    if (meta.getAttribute('media')) meta.remove();
  });

  let themeColor = document.querySelector('meta[name="theme-color"]');
  if (!themeColor) {
    themeColor = document.createElement('meta');
    themeColor.setAttribute('name', 'theme-color');
    document.head.appendChild(themeColor);
  }
  themeColor.setAttribute('content', bg);
}