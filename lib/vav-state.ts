import { refToVid } from './verse-id';
import { VAV_GRAPH_LIMITS } from './vav-graph-limits';

export const VAV_MAX_SELECTION = 100;

export type VavPersistedState = {
  activeRef: string;
  selectionHistory: string[];
  minVotes: number;
  linkLayers: number;
};

export const DEFAULT_VAV_STATE: VavPersistedState = {
  activeRef: 'Genesis 1:1',
  selectionHistory: ['Genesis 1:1'],
  minVotes: 0,
  linkLayers: 1,
};

const VAV_STATE_COOKIE = 'paleomem_vav_state';
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

function isValidRef(ref: unknown): ref is string {
  return typeof ref === 'string' && refToVid(ref.trim()) != null;
}

function normalizePersistedState(raw: unknown): VavPersistedState | null {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;
  const history = Array.isArray(record.selectionHistory)
    ? record.selectionHistory.filter(isValidRef).map((ref) => ref.trim()).slice(0, VAV_MAX_SELECTION)
    : [];

  if (history.length === 0) {
    if (!isValidRef(record.activeRef)) return null;
    history.push(record.activeRef.trim());
  }

  const activeCandidate = isValidRef(record.activeRef) ? record.activeRef.trim() : history[0];
  const withoutActive = history.filter((ref) => ref !== activeCandidate);
  const selectionHistory = [activeCandidate, ...withoutActive].slice(0, VAV_MAX_SELECTION);

  const minVotes =
    typeof record.minVotes === 'number' && Number.isFinite(record.minVotes) && record.minVotes >= 0
      ? Math.floor(record.minVotes)
      : 0;

  const linkLayers =
    typeof record.linkLayers === 'number' && Number.isFinite(record.linkLayers)
      ? Math.min(VAV_GRAPH_LIMITS.maxLinkLayers, Math.max(1, Math.floor(record.linkLayers)))
      : 1;

  return {
    activeRef: selectionHistory[0],
    selectionHistory,
    minVotes,
    linkLayers,
  };
}

export function getVavState(): VavPersistedState | null {
  const raw = getCookie(VAV_STATE_COOKIE);
  if (!raw) return null;
  try {
    return normalizePersistedState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function setVavState(state: VavPersistedState): void {
  const selectionHistory = state.selectionHistory.slice(0, VAV_MAX_SELECTION);
  const activeRef = selectionHistory[0] ?? state.activeRef;
  const payload: VavPersistedState = {
    activeRef,
    selectionHistory,
    minVotes: state.minVotes,
    linkLayers: state.linkLayers,
  };
  setCookie(VAV_STATE_COOKIE, JSON.stringify(payload));
}

export function appendToVavSelection(history: string[], ref: string): string[] {
  const without = history.filter((entry) => entry !== ref);
  return [ref, ...without].slice(0, VAV_MAX_SELECTION);
}