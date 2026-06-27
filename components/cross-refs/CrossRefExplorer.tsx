'use client';

import dynamic from 'next/dynamic';
import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
  edgesForLayeredGraph,
  isCrossRefDataLoaded,
  lookupCrossRefs,
} from '../../lib/cross-refs';
import {
  appendToVavSelection,
  DEFAULT_VAV_STATE,
  getVavState,
  setVavState,
  type VavPersistedState,
} from '../../lib/vav-state';
import { VAV_GRAPH_LIMITS } from '../../lib/vav-graph-limits';
import { refToVid, vidToRef } from '../../lib/verse-id';

const CrossRefGraph = dynamic(() => import('./CrossRefGraph').then((m) => m.CrossRefGraph), {
  ssr: false,
  loading: () => <VavLoadingState variant="graph" label="Loading graph…" />,
});
import { VavLoadingState } from '../vav/VavLoadingState';
import { CrossRefVerseTexts } from './CrossRefVerseTexts';
import { ScriptureVerseNavigator } from './ScriptureVerseNavigator';

let bootstrappedVavState: VavPersistedState | undefined;

function getBootstrappedVavState(): VavPersistedState {
  if (bootstrappedVavState === undefined) {
    bootstrappedVavState = getVavState() ?? DEFAULT_VAV_STATE;
  }
  return bootstrappedVavState;
}

export function CrossRefExplorer() {
  const [activeRef, setActiveRef] = useState(() => getBootstrappedVavState().activeRef);
  const [selectionHistory, setSelectionHistory] = useState(
    () => getBootstrappedVavState().selectionHistory,
  );
  const [minVotes, setMinVotes] = useState(() => getBootstrappedVavState().minVotes);
  const [linkLayers, setLinkLayers] = useState(() => getBootstrappedVavState().linkLayers);
  const [hoverVid, setHoverVid] = useState<number | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setVavState({ activeRef, selectionHistory, minVotes, linkLayers });
    }, 200);
    return () => window.clearTimeout(timeoutId);
  }, [activeRef, selectionHistory, minVotes, linkLayers]);

  const selectRef = (ref: string) => {
    setActiveRef(ref);
    setLinkLayers(1);
    setHoverVid(null);
    setSelectionHistory((prev) => appendToVavSelection(prev, ref));
  };

  const removeRef = (ref: string) => {
    const next = selectionHistory.filter((r) => r !== ref);
    setSelectionHistory(next);
    if (ref === activeRef && next.length > 0) {
      setActiveRef(next[0]);
    }
    setHoverVid(null);
  };

  const resetVav = () => {
    setActiveRef(DEFAULT_VAV_STATE.activeRef);
    setSelectionHistory(DEFAULT_VAV_STATE.selectionHistory);
    setMinVotes(DEFAULT_VAV_STATE.minVotes);
    setLinkLayers(DEFAULT_VAV_STATE.linkLayers);
    setHoverVid(null);
  };

  const isAtDefault =
    activeRef === DEFAULT_VAV_STATE.activeRef &&
    selectionHistory.length === DEFAULT_VAV_STATE.selectionHistory.length &&
    selectionHistory.every((ref, index) => ref === DEFAULT_VAV_STATE.selectionHistory[index]) &&
    minVotes === DEFAULT_VAV_STATE.minVotes &&
    linkLayers === DEFAULT_VAV_STATE.linkLayers;

  const deferredActiveRef = useDeferredValue(activeRef);
  const deferredMinVotes = useDeferredValue(minVotes);
  const deferredLinkLayers = useDeferredValue(linkLayers);

  const isGraphLoading =
    deferredActiveRef !== activeRef ||
    deferredMinVotes !== minVotes ||
    deferredLinkLayers !== linkLayers;

  const lookup = useMemo(
    () => lookupCrossRefs(deferredActiveRef, deferredMinVotes),
    [deferredActiveRef, deferredMinVotes],
  );
  const graph = useMemo(
    () => edgesForLayeredGraph(deferredActiveRef, deferredMinVotes, deferredLinkLayers),
    [deferredActiveRef, deferredMinVotes, deferredLinkLayers],
  );

  const centerVid = refToVid(deferredActiveRef);

  const selectedRef = selectionHistory[0] ?? activeRef;
  const selectedVid = refToVid(selectedRef);

  if (!isCrossRefDataLoaded()) {
    return (
      <div className="card p-6 text-sm text-[var(--pw-text-muted)]">
        Vav data not loaded. Run{' '}
        <code className="text-[var(--pw-vav-accent)]">npm run data:fetch:cross-refs</code> to
        generate TSK indexes.
      </div>
    );
  }

  const stepperButtonClass =
    'inline-flex h-5 w-5 items-center justify-center rounded text-[var(--pw-text-muted)] hover:bg-[var(--pw-bg-elevated)] hover:text-[var(--pw-text)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors';

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <ScriptureVerseNavigator currentRef={activeRef} onSelect={selectRef} />

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--pw-text-faint)]">
          <label className="inline-flex items-center gap-1.5">
            <span>Votes ≥</span>
            <input
              type="range"
              min={0}
              max={Math.min(lookup?.maxVotes ?? 500, 500)}
              value={minVotes}
              onChange={(e) => setMinVotes(parseInt(e.target.value, 10))}
              className="w-20 accent-[var(--pw-vav-accent)]"
              aria-label="Minimum cross-reference votes"
            />
            <span className="font-mono tabular-nums text-[var(--pw-text-muted)] min-w-[2ch]">
              {minVotes}
            </span>
          </label>

          <span className="text-[var(--pw-border)] hidden sm:inline" aria-hidden>
            |
          </span>

          <div className="inline-flex items-center gap-1">
            <span>Layers</span>
            <button
              type="button"
              onClick={() => setLinkLayers((n) => Math.max(1, n - 1))}
              disabled={linkLayers <= 1}
              className={stepperButtonClass}
              aria-label="Remove link layer"
            >
              −
            </button>
            <span className="font-mono tabular-nums text-[var(--pw-text-muted)] min-w-[1ch] text-center">
              {linkLayers}
            </span>
            <button
              type="button"
              onClick={() => setLinkLayers((n) => Math.min(VAV_GRAPH_LIMITS.maxLinkLayers, n + 1))}
              disabled={linkLayers >= VAV_GRAPH_LIMITS.maxLinkLayers}
              className={stepperButtonClass}
              aria-label="Add link layer"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={resetVav}
            disabled={isAtDefault}
            className="text-[var(--pw-text-faint)] hover:text-[var(--pw-text)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors sm:ml-auto"
            aria-label="Reset to Genesis 1:1 and clear selected verses"
          >
            Reset
          </button>
        </div>
      </div>

      {graph?.stats.truncated && graph.stats.message && (
        <p className="text-xs text-[var(--pw-text-muted)] rounded-lg border border-[var(--pw-border)] bg-[var(--pw-bg-elevated)]/50 px-3 py-2">
          {graph.stats.message}
        </p>
      )}

      {isGraphLoading ? (
        <VavLoadingState variant="graph" label="Building graph…" />
      ) : graph && centerVid != null ? (
        <CrossRefGraph
          centerVid={centerVid}
          edges={graph.edges}
          maxVotes={graph.maxVotes ?? lookup?.maxVotes ?? 1}
          minVotes={deferredMinVotes}
          linkLayers={deferredLinkLayers}
          highlightVid={hoverVid}
          selectedVid={selectedVid}
          onHoverVid={setHoverVid}
          onSelectVid={(vid) => selectRef(vidToRef(vid))}
        />
      ) : (
        <div className="card p-4 text-sm text-[var(--pw-text-muted)]">
          No cross-references found for <span className="font-mono">{activeRef}</span>.
        </div>
      )}

      <CrossRefVerseTexts
        refs={selectionHistory}
        selectedRef={selectedRef}
        onSelectRef={selectRef}
        onRemoveRef={removeRef}
      />
    </div>
  );
}