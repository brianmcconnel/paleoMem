'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { OrthographicView, type Layer, type PickingInfo } from '@deck.gl/core';
import { LineLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import { VAV_GRAPH_SURFACE_HEIGHT } from '../vav/VavLoadingState';
import { getCrossRefVerseText } from '../../lib/cross-ref-verse-text';
import type { CrossRefEdge } from '../../lib/cross-refs';
import {
  applyVerseSpacingByDegreeAndZoom,
  buildEgoGraph,
  layoutForceGraph,
  verseNodeRadius,
  type GraphLink,
  type LayoutNode,
} from '../../lib/force-graph-layout';
import {
  BOOK_LABEL_CHARACTER_SET,
  CHAPTER_LABEL_CHARACTER_SET,
  VERSE_LABEL_CHARACTER_SET,
  bookNodeVidToBookNum,
  bookNumToBookName,
  bookNumToNodeVid,
  chapterNodeVidToBookChapter,
  isBookNodeVid,
  isChapterNodeVid,
  isHubNodeVid,
  verseAccentColor,
  verseToChapterNodeVid,
  vidToBookNum,
  vidToChapterNum,
  vidToRef,
  vidToVerseNum,
} from '../../lib/verse-id';

const OT_GOLD: [number, number, number, number] = [197, 164, 110, 255];
const NT_BLUE: [number, number, number, number] = [59, 130, 246, 255];
const HIGHLIGHT: [number, number, number, number] = [255, 210, 90, 255];
const BOOK_GREEN: [number, number, number, number] = [74, 222, 128, 255];
const CHAPTER_PURPLE: [number, number, number, number] = [167, 139, 250, 255];
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
  if (isChapterNodeVid(highlightVid)) return chapterNodeVidToBookChapter(highlightVid).bookNum;
  return vidToBookNum(highlightVid);
}

function highlightChapterNum(
  highlightVid: number | null | undefined,
): number | null {
  if (highlightVid == null) return null;
  if (isChapterNodeVid(highlightVid)) return chapterNodeVidToBookChapter(highlightVid).chapter;
  if (isBookNodeVid(highlightVid) || isChapterNodeVid(highlightVid)) return null;
  return vidToChapterNum(highlightVid);
}

function verseBelongsToBook(verseVid: number, bookNum: number | null): boolean {
  if (bookNum == null) return true;
  return vidToBookNum(verseVid) === bookNum;
}

function voteToWidth(votes: number, maxVotes: number, kind: GraphLink['kind']): number {
  if (kind === 'book' || kind === 'chapter') return 1.1;
  if (maxVotes <= 0) return 1;
  const base = kind === 'mesh' ? 0.7 : 1;
  return base + (votes / maxVotes) * (kind === 'mesh' ? 2 : 4);
}

function lineTouchesCenter(line: LineDatum, centerVid: number): boolean {
  if (line.kind !== 'primary' && line.kind !== 'mesh') return false;
  return line.fromVid === centerVid || line.toVid === centerVid;
}

/** Narrower than visual width — deck.gl uses line width for hover hit-testing. */
function linePickWidth(line: LineDatum, maxVotes: number): number {
  return Math.max(1.5, voteToWidth(line.votes, maxVotes, line.kind) * 0.5);
}

function handleLineHover(
  info: PickingInfo,
  centerVid: number,
  onHover: ((vid: number | null) => void) | undefined,
): void {
  if (!info.object) {
    onHover?.(null);
    return;
  }
  const line = info.object as LineDatum;
  if (line.kind === 'book' || line.kind === 'chapter') {
    onHover?.(line.toVid);
    return;
  }
  onHover?.(
    line.fromVid === centerVid
      ? line.toVid
      : line.toVid === centerVid
        ? line.fromVid
        : line.toVid,
  );
}

function baseLineColor(kind: GraphLink['kind']): [number, number, number, number] {
  if (kind === 'chapter') return [167, 139, 250, 110];
  if (kind === 'book') return [74, 222, 128, 120];
  if (kind === 'mesh') return [120, 135, 160, 100];
  return [80, 150, 240, 170];
}

function lineConnectsVid(line: LineDatum, vid: number | null | undefined): boolean {
  if (vid == null) return false;
  return line.fromVid === vid || line.toVid === vid;
}

function chapterLinkForVerse(line: LineDatum, verseVid: number | null | undefined): boolean {
  if (verseVid == null || isHubNodeVid(verseVid)) return false;
  return line.kind === 'chapter' && line.fromVid === verseVid;
}

function bookLinkForChapterOfVerse(
  line: LineDatum,
  verseVid: number | null | undefined,
): boolean {
  if (verseVid == null || isHubNodeVid(verseVid)) return false;
  return line.kind === 'book' && line.fromVid === verseToChapterNodeVid(verseVid);
}

function membershipLinkForVerse(
  line: LineDatum,
  verseVid: number | null | undefined,
): boolean {
  return chapterLinkForVerse(line, verseVid) || bookLinkForChapterOfVerse(line, verseVid);
}

function lineTouchesBook(line: LineDatum, bookNum: number | null): boolean {
  if (bookNum == null) return true;
  if (line.kind === 'book') {
    return line.toVid === bookNumToNodeVid(bookNum);
  }
  if (line.kind === 'chapter') {
    const chapterBook = isChapterNodeVid(line.toVid)
      ? chapterNodeVidToBookChapter(line.toVid).bookNum
      : isChapterNodeVid(line.fromVid)
        ? chapterNodeVidToBookChapter(line.fromVid).bookNum
        : vidToBookNum(line.fromVid);
    return chapterBook === bookNum;
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

  if (isChapterNodeVid(activeLinkVid)) {
    if (line.kind === 'chapter') return line.toVid === activeLinkVid;
    if (line.kind === 'book') return line.fromVid === activeLinkVid;
    const { bookNum: chapterBook, chapter } = chapterNodeVidToBookChapter(activeLinkVid);
    if (line.kind === 'primary' || line.kind === 'mesh') {
      return (
        vidToBookNum(line.fromVid) === chapterBook &&
        vidToChapterNum(line.fromVid) === chapter
      ) || (
        vidToBookNum(line.toVid) === chapterBook &&
        vidToChapterNum(line.toVid) === chapter
      );
    }
    return false;
  }

  if (membershipLinkForVerse(line, activeLinkVid)) return true;

  if (line.kind === 'book' || line.kind === 'chapter') {
    return line.fromVid === activeLinkVid || line.toVid === activeLinkVid;
  }

  return lineConnectsVid(line, activeLinkVid);
}

function lineColor(
  line: LineDatum,
  emphasizedLinkVid: number | null | undefined,
): [number, number, number, number] {
  const base = baseLineColor(line.kind);
  if (emphasizedLinkVid == null) return base;

  if (!lineIsActive(line, emphasizedLinkVid)) {
    return [base[0], base[1], base[2], Math.round(base[3] * 0.12)];
  }

  if (membershipLinkForVerse(line, emphasizedLinkVid)) return [120, 255, 175, 255];
  if (line.kind === 'chapter') return [180, 155, 255, 230];
  if (line.kind === 'book') return [74, 222, 128, 220];
  if (lineConnectsVid(line, emphasizedLinkVid)) {
    if (line.kind === 'mesh') return [200, 215, 235, 220];
    return [255, 210, 90, 240];
  }

  return base;
}

function lineWidth(
  line: LineDatum,
  maxVotes: number,
  emphasizedLinkVid: number | null | undefined,
  centerVid: number,
): number {
  const base = voteToWidth(line.votes, maxVotes, line.kind);
  if (emphasizedLinkVid == null) {
    if (lineTouchesCenter(line, centerVid)) {
      return Math.max(0.45, base * 0.42);
    }
    return base;
  }
  if (!lineIsActive(line, emphasizedLinkVid)) return Math.max(0.35, base * 0.4);
  if (membershipLinkForVerse(line, emphasizedLinkVid)) return 3.5;
  if (line.kind === 'chapter') return 2.2;
  if (line.kind === 'book') return 2;
  if (lineConnectsVid(line, emphasizedLinkVid)) return base * 1.5 + 2;
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
  if (node.kind === 'chapter') {
    if (node.vid === highlightVid) return true;
    const bookNum = highlightBookNum(highlightVid);
    const chapterNum = highlightChapterNum(highlightVid);
    if (bookNum != null && node.bookNum === bookNum) {
      if (chapterNum == null || isBookNodeVid(highlightVid)) return true;
      return node.chapterNum === chapterNum;
    }
    return false;
  }
  if (isBookNodeVid(highlightVid)) {
    return verseBelongsToBook(node.vid, highlightBookNum(highlightVid));
  }
  if (isChapterNodeVid(highlightVid)) {
    const { bookNum, chapter } = chapterNodeVidToBookChapter(highlightVid);
    return (
      node.bookNum === bookNum &&
      (node.kind !== 'verse' || node.chapterNum === chapter)
    );
  }
  if (node.vid === highlightVid) return true;
  return crossRefLines.some(
    (line) =>
      line.kind !== 'book' &&
      line.kind !== 'chapter' &&
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
  if (node.kind === 'chapter') return 4 + Math.sqrt(node.degree) * 0.75;
  return verseNodeRadius(node.degree);
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

function chapterFillColor(
  node: LayoutNode,
  highlightVid: number | null | undefined,
  crossRefLines: LineDatum[],
): [number, number, number, number] {
  if (highlightVid != null && !nodeIsActive(node, highlightVid, crossRefLines)) {
    return [CHAPTER_PURPLE[0], CHAPTER_PURPLE[1], CHAPTER_PURPLE[2], 45];
  }
  if (node.vid === highlightVid) return [CHAPTER_PURPLE[0], CHAPTER_PURPLE[1], CHAPTER_PURPLE[2], 255];
  return CHAPTER_PURPLE;
}

const VERSE_TOOLTIP_KJV_MAX = 220;

function truncateKjv(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const slice = text.slice(0, maxLen - 1);
  const lastSpace = slice.lastIndexOf(' ');
  const trimmed = lastSpace > maxLen * 0.55 ? slice.slice(0, lastSpace) : slice;
  return `${trimmed.trimEnd()}…`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function verseTooltipContent(vid: number, degree: number) {
  const ref = vidToRef(vid);
  const verseText = getCrossRefVerseText(ref);
  const kjv = verseText?.kjv
    ? escapeHtml(truncateKjv(verseText.kjv, VERSE_TOOLTIP_KJV_MAX))
    : null;
  const refHtml = escapeHtml(ref);
  const linksHtml = `${degree} link${degree === 1 ? '' : 's'}`;

  const scriptureBlock = kjv
    ? `<p style="margin:0 0 6px;font-size:10px;line-height:1.45;color:#c5ccd6">${kjv}</p>`
    : '';

  return {
    html: `<div style="max-width:260px"><strong style="display:block;margin-bottom:5px;font-size:11px;color:#e8eef5">${refHtml}</strong>${scriptureBlock}<span style="font-size:9px;color:#8b949e">${linksHtml}</span></div>`,
    style: {
      fontSize: '11px',
      lineHeight: '1.45',
      padding: '8px 10px',
    } as Partial<CSSStyleDeclaration>,
  };
}

function graphNodeLabel(vid: number, nodes: LayoutNode[]): string {
  if (isBookNodeVid(vid)) {
    const bookNode = nodes.find((n) => n.vid === vid);
    return bookNode?.bookName ?? `Book ${bookNodeVidToBookNum(vid)}`;
  }
  if (isChapterNodeVid(vid)) {
    const chapterNode = nodes.find((n) => n.vid === vid);
    const { bookNum, chapter } = chapterNodeVidToBookChapter(vid);
    const bookName = bookNumToBookName(bookNum);
    return `${bookName} ${chapter}`;
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

    const bookVid = bookNumToNodeVid(node.bookNum ?? vidToBookNum(node.vid));
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

function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    const update = () => setCoarse(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return coarse;
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
  const coarsePointer = useCoarsePointer();
  const verseTapMinPixels = coarsePointer ? 12 : 4;

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
    const dragged = applyBookDragPositions(graphLayout.nodes, bookDragPositions);
    const nodes = applyVerseSpacingByDegreeAndZoom(
      dragged,
      viewState.zoom,
      graphLayout.zoom,
    );
    const nodeMap = new Map(nodes.map((n) => [n.vid, n]));
    const lines = buildLineData(graphLayout.links, nodeMap);
    const verseNodes = nodes.filter((n) => n.kind === 'verse');
    const bookNodes = nodes.filter((n) => n.kind === 'book');
    const chapterNodes = nodes.filter((n) => n.kind === 'chapter');
    const crossRefLines = lines.filter((l) => l.kind !== 'book' && l.kind !== 'chapter');

    return { nodes, verseNodes, bookNodes, chapterNodes, lines, crossRefLines };
  }, [graphLayout, bookDragPositions, viewState.zoom]);

  useEffect(() => {
    setViewState({ target: [0, 0, 0], zoom: graphLayout.zoom });
  }, [graphKey, graphLayout.zoom]);

  useEffect(() => {
    setWebglError(null);
  }, [graphKey]);

  const { verseNodes, bookNodes, chapterNodes, lines, crossRefLines, nodes } = displayData;
  const emphasizedLinkVid = highlightVid ?? null;

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
      getWidth: (d) => lineWidth(d, maxVotes, emphasizedLinkVid, centerVid),
      widthUnits: 'pixels',
      getColor: (d) => lineColor(d, emphasizedLinkVid),
      parameters: LAYER_PARAMETERS,
      pickable: false,
      updateTriggers: {
        getColor: [emphasizedLinkVid],
        getWidth: [emphasizedLinkVid],
        getSourcePosition: [bookDragPositions],
        getTargetPosition: [bookDragPositions],
      },
    }),
    new LineLayer<LineDatum>({
      id: 'vav-edges-pick',
      data: lines,
      getSourcePosition: (d) => d.source,
      getTargetPosition: (d) => d.target,
      getWidth: (d) => linePickWidth(d, maxVotes),
      widthUnits: 'pixels',
      getColor: [0, 0, 0, 0],
      parameters: LAYER_PARAMETERS,
      pickable: true,
      updateTriggers: {
        getWidth: [maxVotes],
        getSourcePosition: [bookDragPositions],
        getTargetPosition: [bookDragPositions],
      },
      onHover: (info) => handleLineHover(info, centerVid, onHoverRef.current),
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
        if (coarsePointer) return false;
        const node = info.object as LayoutNode | undefined;
        if (node?.kind !== 'book') return false;
        setDraggingBookVid(node.vid);
        updateBookDrag(info);
        return true;
      },
      onDrag: (info) => {
        if (coarsePointer) return false;
        updateBookDrag(info);
        return draggingBookVid != null;
      },
      onDragEnd: (info) => {
        if (coarsePointer) return false;
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
      id: 'vav-chapter-halo',
      data: chapterNodes,
      getPosition: (d) => [d.x, d.y, 0],
      getRadius: (d) => nodeRadius(d) + 3,
      radiusUnits: 'pixels',
      filled: true,
      stroked: false,
      billboard: true,
      getFillColor: (d) => {
        const [r, g, b] = chapterFillColor(d, highlightVid, crossRefLines);
        return [r, g, b, 60] as [number, number, number, number];
      },
      parameters: LAYER_PARAMETERS,
      pickable: false,
      updateTriggers: {
        getFillColor: [highlightVid, crossRefLines.length],
        getPosition: [bookDragPositions],
      },
    }),
    new ScatterplotLayer<LayoutNode>({
      id: 'vav-chapter-core',
      data: chapterNodes,
      getPosition: (d) => [d.x, d.y, 0],
      getRadius: (d) => nodeRadius(d),
      radiusUnits: 'pixels',
      radiusMinPixels: 5,
      radiusMaxPixels: 12,
      filled: true,
      stroked: true,
      billboard: true,
      lineWidthUnits: 'pixels',
      getLineWidth: () => 1.25,
      getFillColor: (d) => chapterFillColor(d, highlightVid, crossRefLines),
      getLineColor: [32, 24, 48, 255],
      parameters: LAYER_PARAMETERS,
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 255, 255, 80],
      onHover: (info) =>
        onHoverRef.current?.(info.object ? (info.object as LayoutNode).vid : null),
      updateTriggers: {
        getFillColor: [highlightVid, crossRefLines.length],
        getPosition: [bookDragPositions],
      },
    }),
    ...(chapterNodes.length > 0
      ? [
          new TextLayer<LayoutNode>({
            id: 'vav-chapter-labels',
            data: chapterNodes,
            getPosition: (d) => [d.x, d.y, 0],
            getText: (d) => d.chapterLabel ?? '',
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
            characterSet: CHAPTER_LABEL_CHARACTER_SET,
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
      radiusMinPixels: verseTapMinPixels,
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
        if (!info.object) return;
        const vid = (info.object as LayoutNode).vid;
        onHoverRef.current?.(vid);
        onSelectRef.current?.(vid);
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
            getText: (d) => String(vidToVerseNum(d.vid)),
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
          return { text: `${bookNode?.bookName ?? 'Book'} · book hub link` };
        }
        if (line.kind === 'chapter') {
          const chapterNode = chapterNodes.find((n) => n.vid === line.toVid);
          const bookName = chapterNode?.bookNum
            ? bookNumToBookName(chapterNode.bookNum)
            : 'Chapter';
          return {
            text: `${bookName} ${chapterNode?.chapterNum ?? ''} · chapter hub link`,
          };
        }
        return {
          text: `${vidToRef(line.fromVid)} ↔ ${vidToRef(line.toVid)}\n${line.votes} votes`,
        };
      }
      const node = info.object as LayoutNode;
      if (node.kind === 'book') {
        return { text: `${node.bookName}\n${node.degree} cross-ref links · drag to reposition` };
      }
      if (node.kind === 'chapter') {
        const bookName = node.bookNum ? bookNumToBookName(node.bookNum) : 'Book';
        return { text: `${bookName} ${node.chapterNum}\n${node.degree} verses in chapter` };
      }
      return verseTooltipContent(node.vid, node.degree);
    },
    [bookNodes, chapterNodes],
  );

  const activeVid = highlightVid ?? selectedVid;
  const tooltip = activeVid ? graphNodeLabel(activeVid, nodes) : vidToRef(centerVid);

  if (webglError) {
    return (
      <div
        className={`relative rounded-xl border border-[var(--pw-border)] overflow-hidden vav-graph-field ${VAV_GRAPH_SURFACE_HEIGHT} flex items-center justify-center p-6`}
      >
        <p className="text-sm text-[var(--pw-text-muted)] text-center">
          WebGL graph unavailable: {webglError}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-xl border border-[var(--pw-border)] overflow-hidden vav-graph-field touch-none ${VAV_GRAPH_SURFACE_HEIGHT}`}
    >
      <div className="absolute top-2 left-2 right-2 sm:left-3 sm:right-auto z-10 text-[10px] uppercase tracking-widest text-[var(--pw-text-faint)] pointer-events-none truncate sm:whitespace-normal">
        <span className="hidden sm:inline">
          Layer {linkLayers} · {verseNodes.length} verses · {chapterNodes.length} chapters ·{' '}
          {bookNodes.length} books · {lines.length} edges · {tooltip}
        </span>
        <span className="sm:hidden">{tooltip}</span>
      </div>
      <div className="absolute bottom-2 left-2 right-2 sm:left-3 sm:right-auto z-10 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[var(--pw-text-faint)] pointer-events-none">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[var(--pw-accent-gold)] inline-block" /> Old Testament
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[var(--pw-accent)] inline-block" /> New Testament
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[var(--pw-success)] inline-block" /> Book hub
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-full inline-block"
            style={{ backgroundColor: 'rgb(167, 139, 250)' }}
          />{' '}
          Chapter hub
        </span>
        <span className="hidden sm:inline text-[var(--pw-text-faint)]">
          Scroll to zoom · drag canvas to pan · drag book hub to reposition · click verse to select
        </span>
        <span className="sm:hidden text-[var(--pw-text-faint)]">
          Pinch to zoom · drag to pan · tap verse to select
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
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: '0',
          left: '0',
          background: 'transparent',
        }}
      />
    </div>
  );
}