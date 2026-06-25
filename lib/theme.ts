import type { ThemeMode } from './site-cookies';

export const THEME_COLORS: Record<ThemeMode, string> = {
  dark: '#0b1118',
  light: '#f7f9fc',
};

/** Apply theme to the document (attribute, color-scheme, mobile browser chrome). */
export function applyThemeToDocument(theme: ThemeMode): void {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme;

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
  themeColor.setAttribute('content', THEME_COLORS[theme]);
}