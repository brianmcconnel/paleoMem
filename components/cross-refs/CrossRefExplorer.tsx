'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { normalizeReference } from '../../data/books';
import { normalizeNtReference } from '../../data/nt-books';
import {
  edgesForGraph,
  getCrossRefMeta,
  isCrossRefDataLoaded,
  lookupCrossRefs,
  type CrossRefEdge,
} from '../../lib/cross-refs';
import { refToVid, vidToRef } from '../../lib/verse-id';
import { CrossRefGraph } from './CrossRefGraph';

const EXAMPLES = ['Genesis 1:1', 'John 1:1', 'Romans 8:28', 'Isaiah 53:5', 'Psalms 23:1'];

function normalizeAnyRef(ref: string): string {
  const trimmed = ref.trim();
  const vid = refToVid(trimmed);
  if (vid != null) return vidToRef(vid);
  const nt = normalizeNtReference(trimmed);
  if (refToVid(nt)) return nt;
  return normalizeReference(trimmed);
}

function EdgeRow({
  edge,
  centerVid,
  onSelect,
}: {
  edge: CrossRefEdge;
  centerVid: number;
  onSelect: (ref: string) => void;
}) {
  const otherVid = edge.direction === 'out' ? edge.toVid : edge.fromVid;
  const ref = vidToRef(otherVid);

  return (
    <button
      type="button"
      onClick={() => onSelect(ref)}
      className="w-full text-left rounded-lg border border-[var(--pw-border)] bg-[var(--pw-bg-elevated)]/50 px-3 py-2.5 hover:border-[var(--pw-accent-gold)]/60 transition-colors"
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-medium text-sm text-[var(--pw-text)]">{ref}</span>
        <span className="text-[10px] font-mono text-[var(--pw-accent-gold)] shrink-0">
          {edge.votes} votes
        </span>
      </div>
      <div className="text-[10px] uppercase tracking-wide text-[var(--pw-text-faint)] mt-0.5">
        {edge.direction === 'out' ? 'Referenced by this verse' : 'References this verse'}
      </div>
    </button>
  );
}

export function CrossRefExplorer() {
  const [query, setQuery] = useState('Genesis 1:1');
  const [activeRef, setActiveRef] = useState('Genesis 1:1');
  const [minVotes, setMinVotes] = useState(0);
  const [limit, setLimit] = useState(20);
  const [hoverVid, setHoverVid] = useState<number | null>(null);
  const [direction, setDirection] = useState<'both' | 'out' | 'in'>('both');

  const meta = getCrossRefMeta();
  const lookup = useMemo(
    () => lookupCrossRefs(activeRef, minVotes, limit),
    [activeRef, minVotes, limit],
  );
  const graph = useMemo(
    () => edgesForGraph(activeRef, minVotes, limit),
    [activeRef, minVotes, limit],
  );

  const listEdges = useMemo(() => {
    if (!lookup) return [];
    const edges =
      direction === 'out'
        ? lookup.outgoing
        : direction === 'in'
          ? lookup.incoming
          : [...lookup.outgoing, ...lookup.incoming];
    return edges.sort((a, b) => b.votes - a.votes).slice(0, limit);
  }, [lookup, direction, limit]);

  const centerVid = refToVid(activeRef);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveRef(normalizeAnyRef(query));
    setHoverVid(null);
  };

  if (!isCrossRefDataLoaded()) {
    return (
      <div className="card p-6 text-sm text-[var(--pw-text-muted)]">
        Cross-reference data not loaded. Run{' '}
        <code className="text-[var(--pw-accent-gold)]">npm run data:fetch:cross-refs</code> to
        generate TSK indexes.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--pw-text)]">
          Scripture Cross-References
        </h1>
        <p className="text-sm text-[var(--pw-text-muted)] mt-1 leading-relaxed max-w-2xl">
          Treasury of Scripture Knowledge links from{' '}
          <a
            href="https://a.openbible.info/data/cross-references.zip"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--pw-link)] hover:underline"
          >
            OpenBible.info
          </a>{' '}
          (CC BY 4.0). Thicker arcs and higher vote counts indicate stronger thematic connections.
        </p>
        {meta && (
          <p className="text-[10px] text-[var(--pw-text-faint)] mt-2">
            {meta.edgeCount.toLocaleString()} edges · top {meta.topN} per verse · max vote{' '}
            {meta.maxVotes}
          </p>
        )}
      </div>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Genesis 1:1"
          className="flex-1 min-w-[200px] rounded-lg border border-[var(--pw-border)] bg-[var(--pw-bg-input)] px-3 py-2 text-sm"
        />
        <button type="submit" className="btn btn-gold text-sm px-4 py-2">
          Search
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => {
              setQuery(ex);
              setActiveRef(ex);
              setHoverVid(null);
            }}
            className="text-xs px-2.5 py-1 rounded-full border border-[var(--pw-border)] text-[var(--pw-text-muted)] hover:border-[var(--pw-accent-gold)]/50 hover:text-[var(--pw-text-soft)]"
          >
            {ex}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2 text-[var(--pw-text-muted)]">
          Min votes
          <input
            type="range"
            min={0}
            max={Math.min(lookup?.maxVotes ?? 500, 500)}
            value={minVotes}
            onChange={(e) => setMinVotes(parseInt(e.target.value, 10))}
            className="w-32 accent-[var(--pw-accent-gold)]"
          />
          <span className="font-mono text-xs w-8">{minVotes}</span>
        </label>
        <label className="flex items-center gap-2 text-[var(--pw-text-muted)]">
          Show
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as 'both' | 'out' | 'in')}
            className="rounded border border-[var(--pw-border)] bg-[var(--pw-bg-input)] px-2 py-1 text-xs"
          >
            <option value="both">Both directions</option>
            <option value="out">Outgoing only</option>
            <option value="in">Incoming only</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-[var(--pw-text-muted)]">
          Limit
          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value, 10))}
            className="rounded border border-[var(--pw-border)] bg-[var(--pw-bg-input)] px-2 py-1 text-xs"
          >
            {[10, 20, 25].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      {graph && centerVid != null ? (
        <CrossRefGraph
          centerVid={centerVid}
          edges={graph.edges}
          maxVotes={lookup?.maxVotes ?? 1}
          highlightVid={hoverVid}
          onHoverVid={setHoverVid}
        />
      ) : (
        <div className="card p-4 text-sm text-[var(--pw-text-muted)]">
          No cross-references found for <span className="font-mono">{activeRef}</span>.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--pw-accent-gold)] mb-3">
            Strongest links — {activeRef}
          </h2>
          <div className="space-y-2">
            {listEdges.length ? (
              listEdges.map((edge) => (
                <EdgeRow
                  key={`${edge.fromVid}-${edge.toVid}-${edge.direction}`}
                  edge={edge}
                  centerVid={centerVid ?? 0}
                  onSelect={(ref) => {
                    setQuery(ref);
                    setActiveRef(ref);
                    setHoverVid(null);
                  }}
                />
              ))
            ) : (
              <p className="text-sm text-[var(--pw-text-muted)]">No links at this threshold.</p>
            )}
          </div>
        </div>

        <div className="card p-4 text-sm text-[var(--pw-text-soft)] leading-relaxed">
          <div className="text-[10px] uppercase tracking-widest text-[var(--pw-text-faint)] mb-2">
            Example — Genesis 1:1
          </div>
          <p className="mb-2">
            TSK links creation passages such as <strong>John 1:1–3</strong>,{' '}
            <strong>Hebrews 11:3</strong>, and <strong>Colossians 1:16–17</strong> — thematic
            parallels on God&apos;s creative word, ranked by community votes.
          </p>
          <p className="text-xs text-[var(--pw-text-muted)]">
            Open a verse in{' '}
            <Link href="/" className="text-[var(--pw-link)] hover:underline">
              paleoMem
            </Link>{' '}
            or{' '}
            <Link href="/koine" className="text-[var(--pw-link)] hover:underline">
              koineHydata
            </Link>{' '}
            to study it in context.
          </p>
        </div>
      </div>
    </div>
  );
}