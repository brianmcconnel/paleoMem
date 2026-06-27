'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { OrthographicView, type Layer, type PickingInfo } from '@deck.gl/core';
import { LineLayer, ScatterplotLayer } from '@deck.gl/layers';
import type { CrossRefEdge } from '../../lib/cross-refs';
import {
  buildEgoGraph,
  layoutForceGraph,
  type GraphLink,
  type LayoutNode,
} from '../../lib/force-graph-layout';
import { verseAccentColor, vidToRef } from '../../lib/verse-id';

const OT_GOLD: [number, number, number, number] = [197, 164, 110, 255];
const NT_BLUE: [number, number, number, number] = [59, 130, 246, 255];
const HIGHLIGHT: [number, number, number, number] = [255, 210, 90, 255];

const ORTHO_VIEW = new OrthographicView({
  id: 'ortho',
  flipY: false,
  near: -1000,
  far: 1000,
});

const LAYER_PARAMETERS = {
  depthWriteEnabled: false,
  depthCompare: 'always' as const,
};

type ViewState = {
  target: [number, number, number];
  zoom: number;
};

interface CrossRefGraphProps {
  centerVid: number;
  edges: CrossRefEdge[];
  maxVotes: number;
  minVotes?: number;
  linkLayers?: number;
  highlightVid?: number | null;
  selectedVid?: number | null;
  onHoverVid?: (vid: number | null) => void;
  onSelectVid?: (vid: number) => void;
}

type LineDatum = {
  source: [number, number];
  target: [number, number];
  votes: number;
  fromVid: number;
  toVid: number;
  kind: GraphLink['kind'];
};

function voteToWidth(votes: number, maxVotes: number, kind: GraphLink['kind']): number {
  if (maxVotes <= 0) return 1;
  const base = kind === 'mesh' ? 0.8 : 1.5;
  return base + (votes / maxVotes) * (kind === 'mesh' ? 3 : 8);
}

function baseLineColor(kind: GraphLink['kind']): [number, number, number, number] {
  if (kind === 'mesh') return [120, 135, 160, 100];
  return [80, 150, 240, 170];
}

function lineConnectsVid(line: LineDatum, vid: number | null | undefined): boolean {
  if (vid == null) return false;
  return line.fromVid === vid || line.toVid === vid;
}

function lineColor(
  line: LineDatum,
  highlightVid: number | null | undefined,
): [number, number, number, number] {
  const base = baseLineColor(line.kind);
  if (highlightVid == null) return base;

  if (lineConnectsVid(line, highlightVid)) {
    if (line.kind === 'mesh') return [200, 215, 235, 220];
    return [255, 210, 90, 240];
  }

  return [base[0], base[1], base[2], Math.round(base[3] * 0.12)];
}

function lineWidth(
  line: LineDatum,
  maxVotes: number,
  highlightVid: number | null | undefined,
): number {
  const base = voteToWidth(line.votes, maxVotes, line.kind);
  if (highlightVid == null) return base;
  if (lineConnectsVid(line, highlightVid)) return base * 1.5 + 2;
  return Math.max(0.4, base * 0.45);
}

function nodeIsLinkedTo(
  nodeVid: number,
  highlightVid: number | null | undefined,
  graphLines: LineDatum[],
): boolean {
  if (highlightVid == null) return true;
  if (nodeVid === highlightVid) return true;
  return graphLines.some(
    (line) =>
      (line.fromVid === highlightVid && line.toVid === nodeVid) ||
      (line.toVid === highlightVid && line.fromVid === nodeVid),
  );
}

/** Pixel radius scales with link count (degree); ~50% of prior sizes. */
function nodeRadius(node: LayoutNode): number {
  return 3 + Math.sqrt(node.degree) * 1.25;
}

function nodeFillColor(
  node: LayoutNode,
  highlightVid: number | null | undefined,
  selectedVid: number | null | undefined,
  graphLines: LineDatum[],
): [number, number, number, number] {
  if (node.vid === highlightVid || node.vid === selectedVid) return HIGHLIGHT;

  const base = verseAccentColor(node.vid) === 'gold' ? OT_GOLD : NT_BLUE;

  if (highlightVid != null && !nodeIsLinkedTo(node.vid, highlightVid, graphLines)) {
    return [base[0], base[1], base[2], 40];
  }

  return base;
}

export function CrossRefGraph({
  centerVid,
  edges,
  maxVotes,
  minVotes = 0,
  linkLayers = 1,
  highlightVid,
  selectedVid,
  onHoverVid,
  onSelectVid,
}: CrossRefGraphProps) {
  const [webglError, setWebglError] = useState<string | null>(null);
  const [viewState, setViewState] = useState<ViewState>({ target: [0, 0, 0], zoom: 0 });

  const onHoverRef = useRef(onHoverVid);
  const onSelectRef = useRef(onSelectVid);
  onHoverRef.current = onHoverVid;
  onSelectRef.current = onSelectVid;

  const graphData = useMemo(() => {
    const graph = buildEgoGraph(centerVid, edges, minVotes);
    const nodes = layoutForceGraph(graph.nodes, graph.links, centerVid, maxVotes);
    const nodeMap = new Map(nodes.map((n) => [n.vid, n]));

    const lines: LineDatum[] = graph.links
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
    for (const node of nodes) {
      maxCoord = Math.max(maxCoord, Math.abs(node.x), Math.abs(node.y));
    }
    const zoom = Math.log2(520 / maxCoord) - 1;

    return { nodes, lines, zoom };
  }, [centerVid, edges, maxVotes, minVotes]);

  useEffect(() => {
    setViewState({ target: [0, 0, 0], zoom: graphData.zoom });
    setWebglError(null);
  }, [centerVid, minVotes, linkLayers, graphData.zoom]);

  const { nodes, lines } = graphData;

  const layers: Layer[] = [
      new LineLayer<LineDatum>({
        id: 'vav-edges',
        data: lines,
        getSourcePosition: (d) => d.source,
        getTargetPosition: (d) => d.target,
        getWidth: (d) => lineWidth(d, maxVotes, highlightVid),
        widthUnits: 'pixels',
        getColor: (d) => lineColor(d, highlightVid),
        parameters: LAYER_PARAMETERS,
        pickable: true,
        updateTriggers: {
          getColor: [highlightVid],
          getWidth: [highlightVid],
        },
        onHover: (info) => {
          if (!info.object) {
            onHoverRef.current?.(null);
            return;
          }
          const line = info.object as LineDatum;
          onHoverRef.current?.(
            line.fromVid === centerVid
              ? line.toVid
              : line.toVid === centerVid
                ? line.fromVid
                : line.toVid,
          );
        },
      }),
      new ScatterplotLayer<LayoutNode>({
        id: 'vav-scatter-halo',
        data: nodes,
        getPosition: (d) => [d.x, d.y, 0],
        getRadius: (d) => nodeRadius(d) + 3,
        radiusUnits: 'pixels',
        filled: true,
        stroked: false,
        billboard: true,
        getFillColor: (d) => {
          const [r, g, b] = nodeFillColor(d, highlightVid, selectedVid, lines);
          return [r, g, b, 55] as [number, number, number, number];
        },
        parameters: LAYER_PARAMETERS,
        pickable: false,
        updateTriggers: {
          getFillColor: [highlightVid, selectedVid, lines.length],
        },
      }),
      new ScatterplotLayer<LayoutNode>({
        id: 'vav-scatter-core',
        data: nodes,
        getPosition: (d) => [d.x, d.y, 0],
        getRadius: (d) => nodeRadius(d),
        radiusUnits: 'pixels',
        radiusMinPixels: 4,
        radiusMaxPixels: 18,
        filled: true,
        stroked: true,
        billboard: true,
        lineWidthUnits: 'pixels',
        getLineWidth: () => 1,
        getFillColor: (d) => nodeFillColor(d, highlightVid, selectedVid, lines),
        getLineColor: [12, 18, 28, 255],
        parameters: LAYER_PARAMETERS,
        pickable: true,
        onHover: (info) =>
          onHoverRef.current?.(info.object ? (info.object as LayoutNode).vid : null),
        onClick: (info) => {
          if (info.object) onSelectRef.current?.((info.object as LayoutNode).vid);
        },
        updateTriggers: {
          getFillColor: [highlightVid, selectedVid, lines.length],
        },
      }),
    ];

  const getTooltip = useCallback((info: PickingInfo) => {
    if (!info.object) return null;
    if ('votes' in (info.object as LineDatum)) {
      const line = info.object as LineDatum;
      return {
        text: `${vidToRef(line.fromVid)} ↔ ${vidToRef(line.toVid)}\n${line.votes} votes`,
      };
    }
    const node = info.object as LayoutNode;
    return { text: `${vidToRef(node.vid)}\n${node.degree} links` };
  }, []);

  const activeVid = highlightVid ?? selectedVid;
  const tooltip = activeVid ? vidToRef(activeVid) : vidToRef(centerVid);
  const deckKey = `${centerVid}-${minVotes}-${linkLayers}-${graphData.nodes.length}`;

  if (webglError) {
    return (
      <div className="relative rounded-xl border border-[var(--pw-border)] overflow-hidden vav-graph-field h-[500px] flex items-center justify-center p-6">
        <p className="text-sm text-[var(--pw-text-muted)] text-center">
          WebGL graph unavailable: {webglError}
        </p>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl border border-[var(--pw-border)] overflow-hidden vav-graph-field">
      <div className="absolute top-2 left-3 z-10 text-[10px] uppercase tracking-widest text-[var(--pw-text-faint)] pointer-events-none">
        Layer {linkLayers} · {graphData.nodes.length} nodes · {graphData.lines.length} edges · {tooltip}
      </div>
      <div className="absolute bottom-2 left-3 z-10 flex flex-wrap gap-3 text-[10px] text-[var(--pw-text-faint)] pointer-events-none">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[var(--pw-accent-gold)] inline-block" /> Old Testament
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[var(--pw-accent)] inline-block" /> New Testament
        </span>
        <span className="text-[var(--pw-text-faint)]">Scroll to zoom · drag to pan · click node to select</span>
      </div>

      <DeckGL
        key={deckKey}
        views={ORTHO_VIEW}
        viewState={viewState}
        onViewStateChange={({ viewState: next }) => setViewState(next as ViewState)}
        controller={{ scrollZoom: true, dragPan: true, dragRotate: false }}
        layers={layers}
        getTooltip={getTooltip}
        onError={(error) => {
          console.error('[Vav graph]', error);
          setWebglError((prev) => prev ?? error?.message ?? 'WebGL initialization failed');
        }}
        style={{ width: '100%', height: '500px', position: 'relative', background: 'transparent' }}
      />
    </div>
  );
}