'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { OrthographicView, type Layer, type PickingInfo } from '@deck.gl/core';
import { LineLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import type { CrossRefEdge } from '../../lib/cross-refs';
import {
  buildEgoGraph,
  layoutForceGraph,
  type GraphLink,
  type LayoutNode,
} from '../../lib/force-graph-layout';
import {
  BOOK_LABEL_CHARACTER_SET,
  VERSE_LABEL_CHARACTER_SET,
  bookNodeVidToBookNum,
  bookNumToNodeVid,
  isBookNodeVid,
  verseAccentColor,
  vidToBookNum,
  vidToChapterVerse,
  vidToRef,
} from '../../lib/verse-id';

const OT_GOLD: [number, number, number, number] = [197, 164, 110, 255];
const NT_BLUE: [number, number, number, number] = [59, 130, 246, 255];
const HIGHLIGHT: [number, number, number, number] = [255, 210, 90, 255];
const BOOK_GREEN: [number, number, number, number] = [74, 222, 128, 255];
const LABEL_WHITE: [number, number, number, number] = [232, 238, 245, 255];

const TEXT_FONT_SETTINGS = {
  sdf: true,
  fontSize: 64,
  buffer: 8,
  radius: 12,
  cutoff: 0.25,
  smoothing: 0.1,
};

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

type BookPosition = { x: number; y: number };

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

function highlightBookNum(
  highlightVid: number | null | undefined,
): number | null {
  if (highlightVid == null) return null;
  if (isBookNodeVid(highlightVid)) return bookNodeVidToBookNum(highlightVid);
  return vidToBookNum(highlightVid);
}

function verseBelongsToBook(verseVid: number, bookNum: number | null): boolean {
  if (bookNum == null) return true;
  return vidToBookNum(verseVid) === bookNum;
}

function voteToWidth(votes: number, maxVotes: number, kind: GraphLink['kind']): number {
  if (kind === 'book') return 1.2;
  if (maxVotes <= 0) return 1;
  const base = kind === 'mesh' ? 0.8 : 1.5;
  return base + (votes / maxVotes) * (kind === 'mesh' ? 3 : 8);
}

function baseLineColor(kind: GraphLink['kind']): [number, number, number, number] {
  if (kind === 'book') return [74, 222, 128, 120];
  if (kind === 'mesh') return [120, 135, 160, 100];
  return [80, 150, 240, 170];
}

function lineConnectsVid(line: LineDatum, vid: number | null | undefined): boolean {
  if (vid == null) return false;
  return line.fromVid === vid || line.toVid === vid;
}

function bookLinkForVerse(line: LineDatum, verseVid: number | null | undefined): boolean {
  if (verseVid == null || isBookNodeVid(verseVid)) return false;
  return line.kind === 'book' && line.fromVid === verseVid;
}

function lineTouchesBook(line: LineDatum, bookNum: number | null): boolean {
  if (bookNum == null) return true;
  if (line.kind === 'book') {
    return line.toVid === -bookNum || line.fromVid === -bookNum;
  }
  return verseBelongsToBook(line.fromVid, bookNum) || verseBelongsToBook(line.toVid, bookNum);
}

function lineIsActive(
  line: LineDatum,
  activeLinkVid: number | null | undefined,
): boolean {
  if (activeLinkVid == null) return true;

  const bookNum = highlightBookNum(activeLinkVid);
  if (isBookNodeVid(activeLinkVid)) {
    return lineTouchesBook(line, bookNum);
  }

  if (bookLinkForVerse(line, activeLinkVid)) return true;

  if (line.kind === 'book') {
    return line.fromVid === activeLinkVid || line.toVid === activeLinkVid;
  }

  return lineConnectsVid(line, activeLinkVid);
}

function lineColor(
  line: LineDatum,
  activeLinkVid: number | null | undefined,
): [number, number, number, number] {
  const base = baseLineColor(line.kind);
  if (activeLinkVid == null) return base;

  if (!lineIsActive(line, activeLinkVid)) {
    return [base[0], base[1], base[2], Math.round(base[3] * 0.12)];
  }

  if (bookLinkForVerse(line, activeLinkVid)) return [120, 255, 175, 255];
  if (line.kind === 'book') return [74, 222, 128, 220];
  if (lineConnectsVid(line, activeLinkVid)) {
    if (line.kind === 'mesh') return [200, 215, 235, 220];
    return [255, 210, 90, 240];
  }

  return base;
}

function lineWidth(
  line: LineDatum,
  maxVotes: number,
  activeLinkVid: number | null | undefined,
): number {
  const base = voteToWidth(line.votes, maxVotes, line.kind);
  if (activeLinkVid == null) return base;
  if (!lineIsActive(line, activeLinkVid)) return Math.max(0.35, base * 0.4);
  if (bookLinkForVerse(line, activeLinkVid)) return 3.5;
  if (line.kind === 'book') return 2;
  if (lineConnectsVid(line, activeLinkVid)) return base * 1.5 + 2;
  return base;
}

function nodeIsActive(
  node: LayoutNode,
  highlightVid: number | null | undefined,
  crossRefLines: LineDatum[],
): boolean {
  if (highlightVid == null) return true;
  if (node.kind === 'book') {
    return node.vid === highlightVid || node.bookNum === highlightBookNum(highlightVid);
  }
  if (isBookNodeVid(highlightVid)) {
    return verseBelongsToBook(node.vid, highlightBookNum(highlightVid));
  }
  if (node.vid === highlightVid) return true;
  return crossRefLines.some(
    (line) =>
      line.kind !== 'book' &&
      ((line.fromVid === highlightVid && line.toVid === node.vid) ||
        (line.toVid === highlightVid && line.fromVid === node.vid)),
  );
}

function labelWhite(
  active: boolean,
): [number, number, number, number] {
  if (active) return LABEL_WHITE;
  return [LABEL_WHITE[0], LABEL_WHITE[1], LABEL_WHITE[2], 55];
}

function nodeRadius(node: LayoutNode): number {
  if (node.kind === 'book') return 5 + Math.sqrt(node.degree) * 0.85;
  return 3 + Math.sqrt(node.degree) * 1.25;
}

function verseFillColor(
  node: LayoutNode,
  highlightVid: number | null | undefined,
  selectedVid: number | null | undefined,
  crossRefLines: LineDatum[],
): [number, number, number, number] {
  if (node.vid === highlightVid || node.vid === selectedVid) return HIGHLIGHT;

  const base = verseAccentColor(node.vid) === 'gold' ? OT_GOLD : NT_BLUE;

  if (highlightVid != null && !nodeIsActive(node, highlightVid, crossRefLines)) {
    return [base[0], base[1], base[2], 40];
  }

  return base;
}

function bookFillColor(
  node: LayoutNode,
  highlightVid: number | null | undefined,
): [number, number, number, number] {
  if (highlightVid != null && !nodeIsActive(node, highlightVid, [])) {
    return [BOOK_GREEN[0], BOOK_GREEN[1], BOOK_GREEN[2], 45];
  }
  if (node.vid === highlightVid) return [BOOK_GREEN[0], BOOK_GREEN[1], BOOK_GREEN[2], 255];
  return BOOK_GREEN;
}

function graphNodeLabel(vid: number, nodes: LayoutNode[]): string {
  if (isBookNodeVid(vid)) {
    const bookNode = nodes.find((n) => n.vid === vid);
    return bookNode?.bookName ?? `Book ${bookNodeVidToBookNum(vid)}`;
  }
  return vidToRef(vid);
}

function applyBookDragPositions(
  baseNodes: LayoutNode[],
  bookDragPositions: Map<number, BookPosition>,
): LayoutNode[] {
  if (!bookDragPositions.size) return baseNodes;

  const baseByVid = new Map(baseNodes.map((n) => [n.vid, n]));
  const deltas = new Map<number, { dx: number; dy: number }>();

  for (const [bookVid, pos] of bookDragPositions) {
    const base = baseByVid.get(bookVid);
    if (!base) continue;
    deltas.set(bookVid, { dx: pos.x - base.x, dy: pos.y - base.y });
  }

  return baseNodes.map((node) => {
    if (node.kind === 'book') {
      const dragged = bookDragPositions.get(node.vid);
      if (dragged) return { ...node, x: dragged.x, y: dragged.y };
      return node;
    }

    const bookVid = bookNumToNodeVid(vidToBookNum(node.vid));
    const delta = deltas.get(bookVid);
    if (!delta) return node;
    return { ...node, x: node.x + delta.dx, y: node.y + delta.dy };
  });
}

function buildLineData(
  links: GraphLink[],
  nodeMap: Map<number, LayoutNode>,
): LineDatum[] {
  return links
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
  const [bookDragPositions, setBookDragPositions] = useState<Map<number, BookPosition>>(
    () => new Map(),
  );
  const [draggingBookVid, setDraggingBookVid] = useState<number | null>(null);

  const onHoverRef = useRef(onHoverVid);
  const onSelectRef = useRef(onSelectVid);
  onHoverRef.current = onHoverVid;
  onSelectRef.current = onSelectVid;

  const graphLayout = useMemo(() => {
    const graph = buildEgoGraph(centerVid, edges, minVotes);
    const nodes = layoutForceGraph(graph.nodes, graph.links, centerVid, maxVotes);

    let maxCoord = 1;
    for (const node of nodes) {
      maxCoord = Math.max(maxCoord, Math.abs(node.x), Math.abs(node.y));
    }
    const zoom = Math.log2(520 / maxCoord) - 1;

    return { links: graph.links, nodes, zoom };
  }, [centerVid, edges, maxVotes, minVotes]);

  const graphKey = `${centerVid}-${minVotes}-${linkLayers}-${graphLayout.nodes.length}`;

  useEffect(() => {
    setBookDragPositions(new Map());
    setDraggingBookVid(null);
  }, [graphKey]);

  const displayData = useMemo(() => {
    const nodes = applyBookDragPositions(graphLayout.nodes, bookDragPositions);
    const nodeMap = new Map(nodes.map((n) => [n.vid, n]));
    const lines = buildLineData(graphLayout.links, nodeMap);
    const verseNodes = nodes.filter((n) => n.kind === 'verse');
    const bookNodes = nodes.filter((n) => n.kind === 'book');
    const crossRefLines = lines.filter((l) => l.kind !== 'book');

    return { nodes, verseNodes, bookNodes, lines, crossRefLines };
  }, [graphLayout, bookDragPositions]);

  useEffect(() => {
    setViewState({ target: [0, 0, 0], zoom: graphLayout.zoom });
  }, [graphKey, graphLayout.zoom]);

  useEffect(() => {
    setWebglError(null);
  }, [graphKey]);

  const { verseNodes, bookNodes, lines, crossRefLines, nodes } = displayData;
  const activeLinkVid = highlightVid ?? selectedVid ?? null;

  const updateBookDrag = useCallback((info: PickingInfo) => {
    const node = info.object as LayoutNode | undefined;
    const coord = info.coordinate;
    if (!node || node.kind !== 'book' || !coord) return;
    setBookDragPositions((prev) => {
      const next = new Map(prev);
      next.set(node.vid, { x: coord[0], y: coord[1] });
      return next;
    });
  }, []);

  const layers: Layer[] = [
    new LineLayer<LineDatum>({
      id: 'vav-edges',
      data: lines,
      getSourcePosition: (d) => d.source,
      getTargetPosition: (d) => d.target,
      getWidth: (d) => lineWidth(d, maxVotes, activeLinkVid),
      widthUnits: 'pixels',
      getColor: (d) => lineColor(d, activeLinkVid),
      parameters: LAYER_PARAMETERS,
      pickable: true,
      updateTriggers: {
        getColor: [activeLinkVid],
        getWidth: [activeLinkVid],
        getSourcePosition: [bookDragPositions],
        getTargetPosition: [bookDragPositions],
      },
      onHover: (info) => {
        if (!info.object) {
          onHoverRef.current?.(null);
          return;
        }
        const line = info.object as LineDatum;
        if (line.kind === 'book') {
          onHoverRef.current?.(line.toVid);
          return;
        }
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
      id: 'vav-book-halo',
      data: bookNodes,
      getPosition: (d) => [d.x, d.y, 0],
      getRadius: (d) => nodeRadius(d) + 4,
      radiusUnits: 'pixels',
      filled: true,
      stroked: false,
      billboard: true,
      getFillColor: (d) => {
        const [r, g, b] = bookFillColor(d, highlightVid);
        return [r, g, b, 70] as [number, number, number, number];
      },
      parameters: LAYER_PARAMETERS,
      pickable: false,
      updateTriggers: {
        getFillColor: [highlightVid],
        getPosition: [bookDragPositions],
      },
    }),
    new ScatterplotLayer<LayoutNode>({
      id: 'vav-book-core',
      data: bookNodes,
      getPosition: (d) => [d.x, d.y, 0],
      getRadius: (d) => nodeRadius(d),
      radiusUnits: 'pixels',
      radiusMinPixels: 7,
      radiusMaxPixels: 16,
      filled: true,
      stroked: true,
      billboard: true,
      lineWidthUnits: 'pixels',
      getLineWidth: () => 1.5,
      getFillColor: (d) => bookFillColor(d, highlightVid),
      getLineColor: [20, 40, 28, 255],
      parameters: LAYER_PARAMETERS,
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 255, 255, 80],
      onHover: (info) =>
        onHoverRef.current?.(info.object ? (info.object as LayoutNode).vid : null),
      onDragStart: (info) => {
        const node = info.object as LayoutNode | undefined;
        if (node?.kind !== 'book') return false;
        setDraggingBookVid(node.vid);
        updateBookDrag(info);
        return true;
      },
      onDrag: (info) => {
        updateBookDrag(info);
        return draggingBookVid != null;
      },
      onDragEnd: (info) => {
        updateBookDrag(info);
        setDraggingBookVid(null);
        return true;
      },
      updateTriggers: {
        getFillColor: [highlightVid],
        getPosition: [bookDragPositions],
      },
    }),
    ...(bookNodes.length > 0
      ? [
          new TextLayer<LayoutNode>({
            id: 'vav-book-labels',
            data: bookNodes,
            getPosition: (d) => [d.x, d.y - 14, 0],
            getText: (d) => d.bookName ?? '',
            getColor: (d) => labelWhite(nodeIsActive(d, highlightVid, [])),
            getSize: 11,
            sizeUnits: 'pixels',
            getTextAnchor: 'middle',
            getAlignmentBaseline: 'bottom',
            billboard: true,
            fontFamily: 'Monaco, monospace',
            fontWeight: 'normal',
            fontSettings: TEXT_FONT_SETTINGS,
            outlineWidth: 2,
            outlineColor: [11, 17, 24, 220],
            parameters: LAYER_PARAMETERS,
            pickable: false,
            characterSet: BOOK_LABEL_CHARACTER_SET,
            updateTriggers: {
              getColor: [highlightVid],
              getPosition: [bookDragPositions],
            },
          }),
        ]
      : []),
    new ScatterplotLayer<LayoutNode>({
      id: 'vav-scatter-halo',
      data: verseNodes,
      getPosition: (d) => [d.x, d.y, 0],
      getRadius: (d) => nodeRadius(d) + 3,
      radiusUnits: 'pixels',
      filled: true,
      stroked: false,
      billboard: true,
      getFillColor: (d) => {
        const [r, g, b] = verseFillColor(d, highlightVid, selectedVid, crossRefLines);
        return [r, g, b, 55] as [number, number, number, number];
      },
      parameters: LAYER_PARAMETERS,
      pickable: false,
      updateTriggers: {
        getFillColor: [highlightVid, selectedVid, crossRefLines.length],
        getPosition: [bookDragPositions],
      },
    }),
    new ScatterplotLayer<LayoutNode>({
      id: 'vav-scatter-core',
      data: verseNodes,
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
      getFillColor: (d) => verseFillColor(d, highlightVid, selectedVid, crossRefLines),
      getLineColor: [12, 18, 28, 255],
      parameters: LAYER_PARAMETERS,
      pickable: true,
      onHover: (info) =>
        onHoverRef.current?.(info.object ? (info.object as LayoutNode).vid : null),
      onClick: (info) => {
        if (info.object) onSelectRef.current?.((info.object as LayoutNode).vid);
      },
      updateTriggers: {
        getFillColor: [highlightVid, selectedVid, crossRefLines.length],
        getPosition: [bookDragPositions],
      },
    }),
    ...(verseNodes.length > 0
      ? [
          new TextLayer<LayoutNode>({
            id: 'vav-verse-labels',
            data: verseNodes,
            getPosition: (d) => [d.x, d.y, 0],
            getText: (d) => vidToChapterVerse(d.vid),
            getColor: (d) => labelWhite(nodeIsActive(d, highlightVid, crossRefLines)),
            getSize: 9,
            sizeUnits: 'pixels',
            getTextAnchor: 'middle',
            getAlignmentBaseline: 'center',
            billboard: true,
            fontFamily: 'Monaco, monospace',
            fontWeight: 'normal',
            fontSettings: TEXT_FONT_SETTINGS,
            outlineWidth: 2,
            outlineColor: [11, 17, 24, 220],
            parameters: LAYER_PARAMETERS,
            pickable: false,
            characterSet: VERSE_LABEL_CHARACTER_SET,
            updateTriggers: {
              getColor: [highlightVid, selectedVid],
              getPosition: [bookDragPositions],
            },
          }),
        ]
      : []),
  ];

  const getTooltip = useCallback(
    (info: PickingInfo) => {
      if (!info.object) return null;
      if ('votes' in (info.object as LineDatum)) {
        const line = info.object as LineDatum;
        if (line.kind === 'book') {
          const bookNode = bookNodes.find((n) => n.vid === line.toVid);
          return { text: `${bookNode?.bookName ?? 'Book'} · membership link` };
        }
        return {
          text: `${vidToRef(line.fromVid)} ↔ ${vidToRef(line.toVid)}\n${line.votes} votes`,
        };
      }
      const node = info.object as LayoutNode;
      if (node.kind === 'book') {
        return { text: `${node.bookName}\n${node.degree} cross-ref links · drag to reposition` };
      }
      return { text: `${vidToRef(node.vid)}\n${node.degree} links` };
    },
    [bookNodes],
  );

  const activeVid = highlightVid ?? selectedVid;
  const tooltip = activeVid ? graphNodeLabel(activeVid, nodes) : vidToRef(centerVid);

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
        Layer {linkLayers} · {verseNodes.length} verses · {bookNodes.length} books ·{' '}
        {lines.length} edges · {tooltip}
      </div>
      <div className="absolute bottom-2 left-3 z-10 flex flex-wrap gap-3 text-[10px] text-[var(--pw-text-faint)] pointer-events-none">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[var(--pw-accent-gold)] inline-block" /> Old Testament
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[var(--pw-accent)] inline-block" /> New Testament
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[var(--pw-success)] inline-block" /> Book hub
        </span>
        <span className="text-[var(--pw-text-faint)]">
          Scroll to zoom · drag canvas to pan · drag book hub to reposition · click verse to select
        </span>
      </div>

      <DeckGL
        key={graphKey}
        views={ORTHO_VIEW}
        viewState={viewState}
        onViewStateChange={({ viewState: next }) => {
          if (draggingBookVid != null) return;
          setViewState(next as ViewState);
        }}
        controller={{ scrollZoom: true, dragPan: draggingBookVid == null, dragRotate: false }}
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