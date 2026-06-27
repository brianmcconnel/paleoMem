'use client';

import React, { useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { OrthographicView } from '@deck.gl/core';
import { LineLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import type { CrossRefEdge } from '../../lib/cross-refs';
import { buildEgoGraph, layoutForceGraph, type GraphLink, type LayoutNode } from '../../lib/force-graph-layout';
import { vidToRef } from '../../lib/verse-id';

interface CrossRefGraphProps {
  centerVid: number;
  edges: CrossRefEdge[];
  maxVotes: number;
  highlightVid?: number | null;
  onHoverVid?: (vid: number | null) => void;
}

type LineDatum = {
  source: [number, number];
  target: [number, number];
  votes: number;
  fromVid: number;
  toVid: number;
  kind: GraphLink['kind'];
};

const ORTHO_VIEW = new OrthographicView({ id: 'ortho' });

function voteToWidth(votes: number, maxVotes: number, kind: GraphLink['kind']): number {
  if (maxVotes <= 0) return 1;
  const base = kind === 'mesh' ? 0.6 : 1;
  return base + (votes / maxVotes) * (kind === 'mesh' ? 4 : 10);
}

function voteToColor(
  votes: number,
  maxVotes: number,
  kind: GraphLink['kind'],
): [number, number, number, number] {
  const t = maxVotes > 0 ? votes / maxVotes : 0;
  if (kind === 'mesh') {
    return [90, 110, 150, Math.round(50 + t * 80)];
  }
  const r = Math.round(160 + t * 95);
  const g = Math.round(100 + t * 60);
  const b = Math.round(210 - t * 100);
  return [r, g, b, Math.round(140 + t * 115)];
}

function nodeRadius(node: LayoutNode): number {
  return (node.isCenter ? 16 : 8) + Math.sqrt(node.degree) * 3 + Math.sqrt(node.weight) * 0.15;
}

export function CrossRefGraph({
  centerVid,
  edges,
  maxVotes,
  highlightVid,
  onHoverVid,
}: CrossRefGraphProps) {
  const { nodes, lines, zoom } = useMemo(() => {
    const graph = buildEgoGraph(centerVid, edges);
    const laidOut = layoutForceGraph(graph.nodes, graph.links, centerVid, maxVotes);
    const nodeMap = new Map(laidOut.map((n) => [n.vid, n]));

    const lineData: LineDatum[] = graph.links
      .map((link) => {
        const from = nodeMap.get(link.fromVid);
        const to = nodeMap.get(link.toVid);
        if (!from || !to) return null;
        return {
          source: [from.x, from.y] as [number, number],
          target: [to.x, to.y] as [number, number],
          votes: link.votes,
          fromVid: link.fromVid,
          toVid: link.toVid,
          kind: link.kind,
        };
      })
      .filter((row): row is LineDatum => row != null);

    let maxCoord = 1;
    for (const node of laidOut) {
      maxCoord = Math.max(maxCoord, Math.abs(node.x), Math.abs(node.y));
    }
    const zoom = Math.log2(520 / maxCoord) - 1;

    return { nodes: laidOut, lines: lineData, zoom };
  }, [centerVid, edges, maxVotes]);

  const lineLayer = new LineLayer<LineDatum>({
    id: 'cross-ref-edges',
    data: lines,
    getSourcePosition: (d) => d.source,
    getTargetPosition: (d) => d.target,
    getWidth: (d) => voteToWidth(d.votes, maxVotes, d.kind),
    widthUnits: 'pixels',
    getColor: (d) => voteToColor(d.votes, maxVotes, d.kind),
    pickable: true,
    autoHighlight: true,
    highlightColor: [255, 220, 120, 255],
    onHover: (info) => {
      if (!info.object) {
        onHoverVid?.(null);
        return;
      }
      const line = info.object as LineDatum;
      onHoverVid?.(
        line.fromVid === centerVid
          ? line.toVid
          : line.toVid === centerVid
            ? line.fromVid
            : line.toVid,
      );
    },
  });

  const nodeLayer = new ScatterplotLayer<LayoutNode>({
    id: 'cross-ref-nodes',
    data: nodes,
    getPosition: (d) => [d.x, d.y],
    getRadius: (d) => nodeRadius(d),
    radiusUnits: 'pixels',
    getFillColor: (d) => {
      if (d.vid === highlightVid) return [255, 210, 90, 255];
      if (d.isCenter) return [197, 164, 110, 255];
      const t = Math.min(1, d.degree / 6);
      return [
        Math.round(80 + t * 60),
        Math.round(130 + t * 40),
        Math.round(200 - t * 30),
        230,
      ];
    },
    getLineColor: [30, 40, 55, 200],
    lineWidthUnits: 'pixels',
    getLineWidth: (d) => (d.isCenter ? 2 : 1),
    stroked: true,
    pickable: true,
    onHover: (info) => onHoverVid?.(info.object ? (info.object as LayoutNode).vid : null),
  });

  const labelLayer = new TextLayer<LayoutNode>({
    id: 'cross-ref-labels',
    data: nodes.filter((n) => n.isCenter || n.degree >= 3 || n.vid === highlightVid),
    getPosition: (d) => [d.x, d.y + nodeRadius(d) + 6],
    getText: (d) => vidToRef(d.vid),
    getSize: (d) => (d.isCenter ? 13 : 10),
    getColor: (d) =>
      d.vid === highlightVid ? [255, 220, 140, 255] : [200, 210, 225, 220],
    getTextAnchor: 'middle',
    getAlignmentBaseline: 'top',
    fontFamily: 'system-ui, sans-serif',
    outlineWidth: 2,
    outlineColor: [11, 17, 24, 200],
    pickable: false,
  });

  const tooltip = highlightVid ? vidToRef(highlightVid) : vidToRef(centerVid);

  return (
    <div className="relative rounded-xl border border-[var(--pw-border)] bg-[var(--pw-bg-surface)] overflow-hidden">
      <div className="absolute top-2 left-3 z-10 text-[10px] uppercase tracking-widest text-[var(--pw-text-faint)] pointer-events-none">
        Force layout · edge weight = TSK votes · node size = connections · {tooltip}
      </div>
      <div className="absolute bottom-2 left-3 z-10 flex gap-3 text-[10px] text-[var(--pw-text-faint)] pointer-events-none">
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-0.5 bg-[var(--pw-accent-gold)] inline-block" /> Primary link
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-0.5 bg-[var(--pw-text-subtle)] inline-block opacity-60" /> Neighbor mesh
        </span>
      </div>
      <DeckGL
        views={ORTHO_VIEW}
        initialViewState={{
          target: [0, 0, 0],
          zoom,
        }}
        controller={{ scrollZoom: true, dragPan: true, dragRotate: false }}
        layers={[lineLayer, nodeLayer, labelLayer]}
        getTooltip={({ object }) => {
          if (!object) return null;
          if ('votes' in (object as LineDatum)) {
            const line = object as LineDatum;
            return {
              text: `${vidToRef(line.fromVid)} ↔ ${vidToRef(line.toVid)}\nVotes: ${line.votes}${line.kind === 'mesh' ? ' (shared neighbor)' : ''}`,
            };
          }
          const node = object as LayoutNode;
          return {
            text: `${vidToRef(node.vid)}\n${node.degree} connections · ${Math.round(node.weight)} vote weight`,
          };
        }}
        style={{ width: '100%', height: '480px', background: 'transparent' }}
      />
    </div>
  );
}