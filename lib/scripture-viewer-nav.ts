import { setLastKoineVerse } from './koine-cookies';
import { setLastVerse } from './site-cookies';
import { isNewTestamentVid, refToVid } from './verse-id';

export type ScriptureViewerApp = 'paleoMem' | 'koineHydata';

export function scriptureViewerForRef(ref: string): {
  app: ScriptureViewerApp;
  path: '/' | '/koine';
} | null {
  const vid = refToVid(ref);
  if (vid == null) return null;
  if (isNewTestamentVid(vid)) {
    return { app: 'koineHydata', path: '/koine' };
  }
  return { app: 'paleoMem', path: '/' };
}

export function navigateToScriptureViewer(
  ref: string,
  navigate: (path: '/' | '/koine') => void,
): boolean {
  const target = scriptureViewerForRef(ref);
  if (target == null) return false;
  if (target.app === 'koineHydata') {
    setLastKoineVerse(ref);
  } else {
    setLastVerse(ref);
  }
  navigate(target.path);
  return true;
}