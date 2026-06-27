'use client';

import React, { useMemo, useState } from 'react';
import {
  edgesForLayeredGraph,
  getCrossRefMeta,
  isCrossRefDataLoaded,
  lookupCrossRefs,
} from '../../lib/cross-refs';
import { VAV_GRAPH_LIMITS } from '../../lib/vav-graph-limits';
import { refToVid, verseAccentColor, vidToRef } from '../../lib/verse-id';
import dynamic from 'next/dynamic';

const CrossRefGraph = dynamic(() => import('./CrossRefGraph').then((m) => m.CrossRefGraph), {
  ssr: false,
  loading: () => (
    <div className="relative rounded-xl border border-[var(--pw-border)] overflow-hidden vav-graph-field h-[500px] flex items-center justify-center">
      <p className="text-sm text-[var(--pw-text-muted)]">Loading graph…</p>
    </div>
  ),
});
import { CrossRefVerseTexts } from './CrossRefVerseTexts';
import { ScriptureVerseNavigator } from './ScriptureVerseNavigator';

function verseColorVar(vid: number): string {
  return verseAccentColor(vid) === 'gold' ? 'var(--pw-accent-gold)' : 'var(--pw-accent)';
}

export function CrossRefExplorer() {
  const [activeRef, setActiveRef] = useState('Genesis 1:1');
  const [selectionHistory, setSelectionHistory] = useState<string[]>(['Genesis 1:1']);
  const [minVotes, setMinVotes] = useState(0);
  const [linkLayers, setLinkLayers] = useState(1);
  const [hoverVid, setHoverVid] = useState<number | null>(null);

  const selectRef = (ref: string) => {
    setActiveRef(ref);
    setLinkLayers(1);
    setHoverVid(null);
    setSelectionHistory((prev) => {
      const without = prev.filter((r) => r !== ref);
      return [ref, ...without];
    });
  };

  const removeRef = (ref: string) => {
    const next = selectionHistory.filter((r) => r !== ref);
    setSelectionHistory(next);
    if (ref === activeRef && next.length > 0) {
      setActiveRef(next[0]);
    }
    setHoverVid(null);
  };

  const meta = getCrossRefMeta();
  const lookup = useMemo(
    () => lookupCrossRefs(activeRef, minVotes),
    [activeRef, minVotes],
  );
  const graph = useMemo(
    () => edgesForLayeredGraph(activeRef, minVotes, linkLayers),
    [activeRef, minVotes, linkLayers],
  );

  const centerVid = refToVid(activeRef);

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

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="text-2xl font-semibold tracking-tight vav-title">Vav</h1>
          <span className="scripture-hebrew text-xl text-[var(--pw-vav-accent)]" title="Vav — hook, peg, and">
            ו
          </span>
        </div>
        <p className="text-sm text-[var(--pw-text-muted)] mt-1 leading-relaxed max-w-2xl">
          <span className="text-[var(--pw-text-soft)]">ו</span> — the letter that hooks and joins.
          Explore Treasury of Scripture Knowledge links from{' '}
          <a
            href="https://a.openbible.info/data/cross-references.zip"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--pw-link)] hover:underline"
          >
            OpenBible.info
          </a>{' '}
          (CC BY 4.0) across Old and New Testaments. Gold nodes are OT, blue are NT — stronger
          links pull verses closer in the force layout.
        </p>
        {meta && (
          <p className="text-[10px] text-[var(--pw-text-faint)] mt-2">
            {meta.edgeCount.toLocaleString()} edges · max vote {meta.maxVotes}
          </p>
        )}
      </div>

      <ScriptureVerseNavigator currentRef={activeRef} onSelect={selectRef} />

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2 text-[var(--pw-text-muted)]">
          Min votes
          <input
            type="range"
            min={0}
            max={Math.min(lookup?.maxVotes ?? 500, 500)}
            value={minVotes}
            onChange={(e) => setMinVotes(parseInt(e.target.value, 10))}
            className="w-32 accent-[var(--pw-vav-accent)]"
          />
          <span className="font-mono text-xs w-8">{minVotes}</span>
        </label>
        <div className="flex items-center gap-2 text-[var(--pw-text-muted)]">
          <span>Link layers</span>
          <button
            type="button"
            onClick={() => setLinkLayers((n) => Math.max(1, n - 1))}
            disabled={linkLayers <= 1}
            className="btn text-sm px-2.5 py-1 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Remove link layer"
          >
            −
          </button>
          <span className="font-mono text-xs w-4 text-center tabular-nums">{linkLayers}</span>
          <button
            type="button"
            onClick={() => setLinkLayers((n) => Math.min(VAV_GRAPH_LIMITS.maxLinkLayers, n + 1))}
            disabled={linkLayers >= VAV_GRAPH_LIMITS.maxLinkLayers}
            className="btn text-sm px-2.5 py-1 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Add link layer"
          >
            +
          </button>
          <span className="text-[10px] text-[var(--pw-text-faint)] hidden sm:inline">
            {linkLayers === 1
              ? 'Direct cross-refs only'
              : `Up to ${linkLayers} hops`}
          </span>
        </div>
      </div>

      {graph?.stats.truncated && graph.stats.message && (
        <p className="text-xs text-[var(--pw-text-muted)] rounded-lg border border-[var(--pw-border)] bg-[var(--pw-bg-elevated)]/50 px-3 py-2">
          {graph.stats.message}
        </p>
      )}

      {selectionHistory.length > 0 && (
        <div className="rounded-xl border border-[var(--pw-border)] bg-[var(--pw-bg-elevated)]/40 px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-[var(--pw-vav-accent)] mb-2">
            Selected scripture
          </div>
          <div className="flex flex-wrap gap-2">
            {selectionHistory.map((ref, index) => {
              const vid = refToVid(ref);
              const isCurrent = index === 0;
              const color = vid != null ? verseColorVar(vid) : 'var(--pw-text)';
              return (
                <span
                  key={`${ref}-${index}`}
                  className={`inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-lg border-2 transition-colors ${
                    isCurrent ? 'shadow-sm' : 'opacity-70 hover:opacity-100 border'
                  }`}
                  style={{
                    borderColor: color,
                    ...(isCurrent ? { backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` } : {}),
                  }}
                >
                  <button
                    type="button"
                    onClick={() => selectRef(ref)}
                    className="text-sm font-medium"
                    style={{ color }}
                  >
                    {ref}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRef(ref)}
                    className="text-[var(--pw-text-faint)] hover:text-[var(--pw-text)] text-sm leading-none opacity-50 hover:opacity-100"
                    aria-label={`Remove ${ref}`}
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {graph && centerVid != null ? (
        <CrossRefGraph
          centerVid={centerVid}
          edges={graph.edges}
          maxVotes={graph.maxVotes ?? lookup?.maxVotes ?? 1}
          minVotes={minVotes}
          linkLayers={linkLayers}
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