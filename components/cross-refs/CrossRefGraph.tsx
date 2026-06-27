'use client';

import React, { useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { ArcLayer, ScatterplotLayer } from '@deck.gl/layers';
import type { CrossRefEdge } from '../../lib/cross-refs';
import { vidToPosition } from '../../lib/verse-layout';
import { vidToRef } from '../../lib/verse-id';

interface CrossRefGraphProps {
  centerVid: number;
  edges: CrossRefEdge[];
  maxVotes: number;
  highlightVid?: number | null;
  onHoverVid?: (vid: number | null) => void;
}

type NodeDatum = {
  vid: number;
  position: [number, number];
  isCenter: boolean;
  degree: number;
};

type ArcDatum = {
  source: [number, number];
  target: [number, number];
  votes: number;
  fromVid: number;
  toVid: number;
};

function voteToWidth(votes: number, maxVotes: number): number {
  if (maxVotes <= 0) return 1;
  return 1 + (votes / maxVotes) * 12;
}

function voteToColor(votes: number, maxVotes: number): [number, number, number, number] {
  const t = maxVotes > 0 ? votes / maxVotes : 0;
  const r = Math.round(180 + t * 75);
  const g = Math.round(90 + t * 40);
  const b = Math.round(220 - t * 120);
  return [r, g, b, Math.round(120 + t * 135)];
}

export function CrossRefGraph({
  centerVid,
  edges,
  maxVotes,
  highlightVid,
  onHoverVid,
}: CrossRefGraphProps) {
  const { nodes, arcs } = useMemo(() => {
    const nodeMap = new Map<number, NodeDatum>();
    const addNode = (vid: number, isCenter = false) => {
      const existing = nodeMap.get(vid);
      if (existing) {
        if (isCenter) existing.isCenter = true;
        return;
      }
      nodeMap.set(vid, {
        vid,
        position: vidToPosition(vid),
        isCenter,
        degree: 0,
      });
    };

    addNode(centerVid, true);
    const arcData: ArcDatum[] = [];

    for (const edge of edges) {
      addNode(edge.fromVid);
      addNode(edge.toVid);
      const from = nodeMap.get(edge.fromVid)!;
      const to = nodeMap.get(edge.toVid)!;
      from.degree += 1;
      to.degree += 1;
      arcData.push({
        source: from.position,
        target: to.position,
        votes: edge.votes,
        fromVid: edge.fromVid,
        toVid: edge.toVid,
      });
    }

    return { nodes: [...nodeMap.values()], arcs: arcData };
  }, [centerVid, edges]);

  const nodeLayer = new ScatterplotLayer<NodeDatum>({
    id: 'cross-ref-nodes',
    data: nodes,
    getPosition: (d) => d.position,
    getRadius: (d) => (d.isCenter ? 140 : 60 + d.degree * 15),
    getFillColor: (d) => {
      if (d.vid === highlightVid) return [255, 210, 90, 255];
      if (d.isCenter) return [197, 164, 110, 255];
      return [100, 140, 200, 200];
    },
    pickable: true,
    radiusMinPixels: 4,
    radiusMaxPixels: 14,
    onHover: (info) => onHoverVid?.(info.object ? (info.object as NodeDatum).vid : null),
  });

  const arcLayer = new ArcLayer<ArcDatum>({
    id: 'cross-ref-arcs',
    data: arcs,
    getSourcePosition: (d) => d.source,
    getTargetPosition: (d) => d.target,
    getWidth: (d) => voteToWidth(d.votes, maxVotes),
    getSourceColor: (d) => voteToColor(d.votes, maxVotes),
    getTargetColor: (d) => voteToColor(d.votes, maxVotes),
    pickable: true,
    greatCircle: true,
    onHover: (info) => {
      if (!info.object) {
        onHoverVid?.(null);
        return;
      }
      const arc = info.object as ArcDatum;
      onHoverVid?.(arc.toVid === centerVid ? arc.fromVid : arc.toVid);
    },
  });

  const tooltip = highlightVid
    ? vidToRef(highlightVid)
    : vidToRef(centerVid);

  return (
    <div className="relative rounded-xl border border-[var(--pw-border)] bg-[var(--pw-bg-surface)] overflow-hidden">
      <div className="absolute top-2 left-3 z-10 text-[10px] uppercase tracking-widest text-[var(--pw-text-faint)] pointer-events-none">
        Arc width = TSK vote strength · {tooltip}
      </div>
      <DeckGL
        initialViewState={{
          longitude: 0,
          latitude: 0,
          zoom: 1.2,
          pitch: 0,
          bearing: 0,
        }}
        controller
        layers={[arcLayer, nodeLayer]}
        views={undefined}
        getTooltip={({ object }) => {
          if (!object) return null;
          if ('votes' in (object as ArcDatum)) {
            const arc = object as ArcDatum;
            return {
              text: `${vidToRef(arc.fromVid)} → ${vidToRef(arc.toVid)}\nVotes: ${arc.votes}`,
            };
          }
          const node = object as NodeDatum;
          return { text: vidToRef(node.vid) };
        }}
        style={{ width: '100%', height: '420px', background: 'transparent' }}
      />
    </div>
  );
}