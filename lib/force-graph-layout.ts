import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force';
import type { CrossRefEdge } from './cross-refs';
import { getDirectLinkVotes } from './cross-refs';

export type GraphLink = {
  fromVid: number;
  toVid: number;
  votes: number;
  kind: 'primary' | 'mesh';
};

export type LayoutNode = {
  vid: number;
  isCenter: boolean;
  degree: number;
  weight: number;
  x: number;
  y: number;
};

type SimNode = SimulationNodeDatum & {
  vid: number;
  isCenter: boolean;
  degree: number;
  weight: number;
};

type SimLink = SimulationLinkDatum<SimNode> & {
  votes: number;
  kind: GraphLink['kind'];
};

/** Build an ego-network: center verse, its TSK links, and strongest cross-links among neighbors. */
export function buildEgoGraph(
  centerVid: number,
  edges: CrossRefEdge[],
  meshLimit = 24,
): { nodes: LayoutNode[]; links: GraphLink[] } {
  const degreeMap = new Map<number, number>();
  const weightMap = new Map<number, number>();
  const neighborSet = new Set<number>();

  const bump = (vid: number, votes: number) => {
    degreeMap.set(vid, (degreeMap.get(vid) ?? 0) + 1);
    weightMap.set(vid, (weightMap.get(vid) ?? 0) + votes);
    if (vid !== centerVid) neighborSet.add(vid);
  };

  bump(centerVid, 0);

  const links: GraphLink[] = edges.map((edge) => {
    bump(edge.fromVid, edge.votes);
    bump(edge.toVid, edge.votes);
    return {
      fromVid: edge.fromVid,
      toVid: edge.toVid,
      votes: edge.votes,
      kind: 'primary' as const,
    };
  });

  const neighbors = [...neighborSet];
  const meshCandidates: GraphLink[] = [];

  for (let i = 0; i < neighbors.length; i += 1) {
    for (let j = i + 1; j < neighbors.length; j += 1) {
      const votes = getDirectLinkVotes(neighbors[i], neighbors[j]);
      if (!votes) continue;
      meshCandidates.push({
        fromVid: neighbors[i],
        toVid: neighbors[j],
        votes,
        kind: 'mesh',
      });
    }
  }

  meshCandidates
    .sort((a, b) => b.votes - a.votes)
    .slice(0, meshLimit)
    .forEach((link) => {
      links.push(link);
      bump(link.fromVid, link.votes * 0.5);
      bump(link.toVid, link.votes * 0.5);
    });

  const nodes: LayoutNode[] = [...degreeMap.keys()].map((vid) => ({
    vid,
    isCenter: vid === centerVid,
    degree: degreeMap.get(vid) ?? 0,
    weight: weightMap.get(vid) ?? 0,
    x: 0,
    y: 0,
  }));

  return { nodes, links };
}

/** Force-directed layout: stronger / higher-degree nodes shape cluster structure. */
export function layoutForceGraph(
  nodes: LayoutNode[],
  links: GraphLink[],
  centerVid: number,
  maxVotes: number,
): LayoutNode[] {
  if (!nodes.length) return [];

  const maxVote = Math.max(1, maxVotes);
  const simNodes: SimNode[] = nodes.map((node) => ({
    ...node,
    x: (Math.random() - 0.5) * 40,
    y: (Math.random() - 0.5) * 40,
  }));

  const nodeByVid = new Map(simNodes.map((n) => [n.vid, n]));

  const simLinks: SimLink[] = links
    .map((link) => ({
      source: nodeByVid.get(link.fromVid)!,
      target: nodeByVid.get(link.toVid)!,
      votes: link.votes,
      kind: link.kind,
    }))
    .filter((l) => l.source && l.target);

  const center = nodeByVid.get(centerVid);
  if (center) {
    center.fx = 0;
    center.fy = 0;
  }

  const simulation = forceSimulation(simNodes)
    .force(
      'link',
      forceLink<SimNode, SimLink>(simLinks)
        .strength((link) => {
          const strength = link.votes / maxVote;
          return link.kind === 'mesh' ? 0.08 + strength * 0.25 : 0.2 + strength * 0.85;
        })
        .distance((link) => {
          const t = link.votes / maxVote;
          const base = link.kind === 'mesh' ? 110 : 70;
          return base * (1.4 - t * 0.75);
        }),
    )
    .force(
      'charge',
      forceManyBody<SimNode>()
        .strength((node) => -90 - node.degree * 28 - node.weight * 0.08)
        .distanceMax(420),
    )
    .force('center', forceCenter(0, 0).strength(0.04))
    .force(
      'collide',
      forceCollide<SimNode>()
        .radius((node) => 10 + Math.sqrt(node.degree) * 5 + (node.isCenter ? 8 : 0))
        .strength(0.85),
    )
    .stop();

  const ticks = 280 + Math.min(120, simNodes.length * 4);
  for (let i = 0; i < ticks; i += 1) simulation.tick();

  const scale = fitScale(simNodes, 480);
  return simNodes.map((node) => ({
    vid: node.vid,
    isCenter: node.isCenter,
    degree: node.degree,
    weight: node.weight,
    x: (node.x ?? 0) * scale,
    y: (node.y ?? 0) * scale,
  }));
}

function fitScale(nodes: SimNode[], targetRadius: number): number {
  let maxR = 1;
  for (const node of nodes) {
    const r = Math.hypot(node.x ?? 0, node.y ?? 0);
    if (r > maxR) maxR = r;
  }
  return targetRadius / maxR;
}