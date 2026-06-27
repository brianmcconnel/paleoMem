'use client';

import React, { useMemo, useState } from 'react';
import type { CrossRefEdge } from '../../lib/cross-refs';
import {
  buildEgoGraph,
  layoutForceGraph,
  type GraphLink,
  type LayoutNode,
} from '../../lib/force-graph-layout';
import { vidToRef } from '../../lib/verse-id';

interface CrossRefGraphProps {
  centerVid: number;
  edges: CrossRefEdge[];
  maxVotes: number;
  highlightVid?: number | null;
  onHoverVid?: (vid: number | null) => void;
}

type LineDatum = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  votes: number;
  fromVid: number;
  toVid: number;
  kind: GraphLink['kind'];
};

function voteToWidth(votes: number, maxVotes: number, kind: GraphLink['kind']): number {
  if (maxVotes <= 0) return 1;
  const base = kind === 'mesh' ? 0.6 : 1.2;
  return base + (votes / maxVotes) * (kind === 'mesh' ? 2.5 : 5);
}

function voteToOpacity(votes: number, maxVotes: number, kind: GraphLink['kind']): number {
  const t = maxVotes > 0 ? votes / maxVotes : 0;
  return kind === 'mesh' ? 0.25 + t * 0.35 : 0.45 + t * 0.5;
}

function nodeRadius(node: LayoutNode): number {
  return (node.isCenter ? 18 : 10) + Math.sqrt(node.degree) * 3;
}

function computeBounds(nodes: LayoutNode[]) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const node of nodes) {
    const pad = nodeRadius(node) + 36;
    minX = Math.min(minX, node.x - pad);
    maxX = Math.max(maxX, node.x + pad);
    minY = Math.min(minY, node.y - pad);
    maxY = Math.max(maxY, node.y + pad);
  }
  const pad = 24;
  return {
    minX: minX - pad,
    minY: minY - pad,
    width: maxX - minX + pad * 2,
    height: maxY - minY + pad * 2,
  };
}

export function CrossRefGraph({
  centerVid,
  edges,
  maxVotes,
  highlightVid,
  onHoverVid,
}: CrossRefGraphProps) {
  const [hoveredVid, setHoveredVid] = useState<number | null>(null);

  const graphData = useMemo(() => {
    const graph = buildEgoGraph(centerVid, edges);
    const nodes = layoutForceGraph(graph.nodes, graph.links, centerVid, maxVotes);
    const nodeMap = new Map(nodes.map((n) => [n.vid, n]));

    const lines: LineDatum[] = graph.links
      .map((link) => {
        const from = nodeMap.get(link.fromVid);
        const to = nodeMap.get(link.toVid);
        if (!from || !to) return null;
        return {
          x1: from.x,
          y1: from.y,
          x2: to.x,
          y2: to.y,
          votes: link.votes,
          fromVid: link.fromVid,
          toVid: link.toVid,
          kind: link.kind,
        };
      })
      .filter((row): row is LineDatum => row != null);

    return { nodes, lines, bounds: computeBounds(nodes) };
  }, [centerVid, edges, maxVotes]);

  const activeVid = highlightVid ?? hoveredVid;
  const tooltip = activeVid ? vidToRef(activeVid) : vidToRef(centerVid);

  const handleNodeHover = (vid: number | null) => {
    setHoveredVid(vid);
    onHoverVid?.(vid);
  };

  const { bounds } = graphData;

  return (
    <div className="relative rounded-xl border border-[var(--pw-border)] overflow-hidden cross-ref-graph-field">
      <div className="absolute top-2 left-3 z-10 text-[10px] uppercase tracking-widest text-[var(--pw-text-faint)] pointer-events-none">
        Force layout · {graphData.nodes.length} nodes · {graphData.lines.length} edges · {tooltip}
      </div>
      <div className="absolute bottom-2 left-3 z-10 flex gap-3 text-[10px] text-[var(--pw-text-faint)] pointer-events-none">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[var(--pw-accent-gold)] inline-block" /> Verse node
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-[var(--pw-accent)] inline-block" /> TSK link (thicker = stronger)
        </span>
      </div>

      <svg
        viewBox={`${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`}
        className="w-full h-[500px] block"
        role="img"
        aria-label={`Cross-reference graph for ${vidToRef(centerVid)}`}
      >
        <defs>
          <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {graphData.lines.map((line) => (
          <line
            key={`${line.fromVid}-${line.toVid}-${line.kind}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={line.kind === 'mesh' ? 'var(--pw-text-subtle)' : 'var(--pw-accent)'}
            strokeOpacity={voteToOpacity(line.votes, maxVotes, line.kind)}
            strokeWidth={voteToWidth(line.votes, maxVotes, line.kind)}
            strokeLinecap="round"
          />
        ))}

        {graphData.nodes.map((node) => {
          const r = nodeRadius(node);
          const isActive = node.vid === activeVid;
          const isCenter = node.isCenter;
          const fill = isActive
            ? 'var(--pw-accent-gold)'
            : isCenter
              ? 'var(--pw-accent-gold)'
              : 'var(--pw-accent)';
          const label = vidToRef(node.vid);

          return (
            <g
              key={node.vid}
              className="cursor-pointer"
              onMouseEnter={() => handleNodeHover(node.vid)}
              onMouseLeave={() => handleNodeHover(null)}
              onFocus={() => handleNodeHover(node.vid)}
              onBlur={() => handleNodeHover(null)}
              filter={isActive || isCenter ? 'url(#node-glow)' : undefined}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={r + 6}
                fill={fill}
                opacity={0.2}
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={r}
                fill={fill}
                stroke="var(--pw-text)"
                strokeOpacity={0.85}
                strokeWidth={isCenter ? 2.5 : 1.5}
              />
              <text
                x={node.x}
                y={node.y - r - 8}
                textAnchor="middle"
                fill="var(--pw-text-soft)"
                fontSize={isCenter ? 13 : 10}
                fontWeight={isCenter ? 700 : 500}
                fontFamily="system-ui, sans-serif"
              >
                {label}
              </text>
              {isCenter && (
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  fill="var(--pw-on-gold)"
                  fontSize={9}
                  fontWeight={700}
                  fontFamily="system-ui, sans-serif"
                >
                  ●
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}