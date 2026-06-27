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
import { VAV_GRAPH_LIMITS } from './vav-graph-limits';

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
  hubVid: number;
};

type SimLink = SimulationLinkDatum<SimNode> & {
  votes: number;
  kind: GraphLink['kind'];
};

const LINK_STRENGTH = 0.55;
const PRIMARY_LINK_DISTANCE = 42;
const MESH_LINK_DISTANCE = 30;

/** Build an ego-network: center verse, its TSK links, and cross-links among neighbors. */
export function buildEgoGraph(
  centerVid: number,
  edges: CrossRefEdge[],
  minVotes = 0,
): { nodes: LayoutNode[]; links: GraphLink[] } {
  const degreeMap = new Map<number, number>();
  const weightMap = new Map<number, number>();

  const bump = (vid: number, votes: number) => {
    degreeMap.set(vid, (degreeMap.get(vid) ?? 0) + 1);
    weightMap.set(vid, (weightMap.get(vid) ?? 0) + votes);
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

  const meshNodes = [...degreeMap.keys()]
    .filter((vid) => vid !== centerVid)
    .sort((a, b) => (degreeMap.get(b) ?? 0) - (degreeMap.get(a) ?? 0))
    .slice(0, VAV_GRAPH_LIMITS.meshMaxNeighbors);

  const meshCandidates: GraphLink[] = [];

  for (let i = 0; i < meshNodes.length; i += 1) {
    for (let j = i + 1; j < meshNodes.length; j += 1) {
      const votes = getDirectLinkVotes(meshNodes[i], meshNodes[j]);
      if (votes == null || votes < minVotes) continue;
      meshCandidates.push({
        fromVid: meshNodes[i],
        toVid: meshNodes[j],
        votes,
        kind: 'mesh',
      });
    }
  }

  meshCandidates
    .sort((a, b) => b.votes - a.votes)
    .slice(0, VAV_GRAPH_LIMITS.maxMeshLinks)
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

function connectionScore(links: GraphLink[], a: number, b: number): number {
  let edges = 0;
  let votes = 0;
  for (const link of links) {
    const match =
      (link.fromVid === a && link.toVid === b) || (link.fromVid === b && link.toVid === a);
    if (!match) continue;
    edges += 1;
    votes += link.votes;
  }
  return edges > 0 ? edges * 10_000 + votes : -1;
}

/** High-degree nodes become local cluster hubs; the selected center is not a layout hub. */
function pickHubVids(nodes: LayoutNode[], centerVid: number): Set<number> {
  const sorted = [...nodes]
    .filter((n) => n.vid !== centerVid)
    .sort((a, b) => b.degree - a.degree);
  if (!sorted.length) return new Set();

  const maxHubs = Math.min(16, Math.max(3, Math.round(Math.sqrt(sorted.length))));
  const minHubDegree = Math.max(3, sorted[0]?.degree >= 6 ? 3 : 2);

  const hubs = new Set<number>();
  for (const node of sorted) {
    if (node.degree < minHubDegree) break;
    hubs.add(node.vid);
    if (hubs.size >= maxHubs) break;
  }

  if (!hubs.size) hubs.add(sorted[0].vid);
  return hubs;
}

function nearestHubByPath(
  startVid: number,
  hubVids: Set<number>,
  links: GraphLink[],
): number | null {
  const adjacency = new Map<number, number[]>();
  const addEdge = (a: number, b: number) => {
    const listA = adjacency.get(a) ?? [];
    listA.push(b);
    adjacency.set(a, listA);
    const listB = adjacency.get(b) ?? [];
    listB.push(a);
    adjacency.set(b, listB);
  };
  for (const link of links) addEdge(link.fromVid, link.toVid);

  const queue: number[] = [startVid];
  const visited = new Set<number>([startVid]);

  while (queue.length) {
    const vid = queue.shift()!;
    if (hubVids.has(vid)) return vid;
    for (const next of adjacency.get(vid) ?? []) {
      if (visited.has(next)) continue;
      visited.add(next);
      queue.push(next);
    }
  }

  return null;
}

function assignHubs(
  nodes: LayoutNode[],
  links: GraphLink[],
  hubVids: Set<number>,
): Map<number, number> {
  const assignment = new Map<number, number>();

  for (const node of nodes) {
    if (hubVids.has(node.vid)) {
      assignment.set(node.vid, node.vid);
      continue;
    }

    let bestHub: number | null = null;
    let bestScore = -1;

    for (const hubVid of hubVids) {
      const score = connectionScore(links, node.vid, hubVid);
      if (score > bestScore) {
        bestScore = score;
        bestHub = hubVid;
      }
    }

    if (bestHub != null && bestScore >= 0) {
      assignment.set(node.vid, bestHub);
      continue;
    }

    const pathHub = nearestHubByPath(node.vid, hubVids, links);
    assignment.set(node.vid, pathHub ?? [...hubVids][0]);
  }

  return assignment;
}

function seedHubLayout(
  simNodes: SimNode[],
  hubVids: Set<number>,
  hubOf: Map<number, number>,
): void {
  const nodeByVid = new Map(simNodes.map((n) => [n.vid, n]));
  const hubs = [...hubVids];
  const hubRadius = 130;

  hubs.forEach((hubVid, index) => {
    const hub = nodeByVid.get(hubVid);
    if (!hub) return;
    const angle = (2 * Math.PI * index) / Math.max(1, hubs.length) - Math.PI / 2;
    hub.x = Math.cos(angle) * hubRadius;
    hub.y = Math.sin(angle) * hubRadius;
  });

  const centerNode = simNodes.find((n) => n.isCenter);
  if (centerNode) {
    centerNode.x = 0;
    centerNode.y = 0;
  }

  const membersByHub = new Map<number, SimNode[]>();
  for (const node of simNodes) {
    if (hubVids.has(node.vid) || node.isCenter) continue;
    const hubVid = hubOf.get(node.vid) ?? node.vid;
    const group = membersByHub.get(hubVid) ?? [];
    group.push(node);
    membersByHub.set(hubVid, group);
  }

  for (const [hubVid, members] of membersByHub) {
    const hub = nodeByVid.get(hubVid);
    if (!hub) continue;
    members.forEach((node, index) => {
      const angle = (2 * Math.PI * index) / Math.max(1, members.length);
      const orbit = 22 + Math.min(members.length, 10) * 2.5;
      node.x = (hub.x ?? 0) + Math.cos(angle) * orbit;
      node.y = (hub.y ?? 0) + Math.sin(angle) * orbit;
    });
  }
}

/** Pull each verse toward its assigned high-degree hub (connection-based, not vote-weighted). */
function forceHubGravity(nodes: SimNode[], hubOf: Map<number, number>) {
  const strength = 0.11;

  return (alpha: number) => {
    const byVid = new Map(nodes.map((n) => [n.vid, n]));

    for (const node of nodes) {
      if (node.isCenter) continue;
      const hubVid = hubOf.get(node.vid) ?? node.vid;
      if (hubVid === node.vid) continue;

      const hub = byVid.get(hubVid);
      if (!hub) continue;

      const dx = (hub.x ?? 0) - (node.x ?? 0);
      const dy = (hub.y ?? 0) - (node.y ?? 0);
      node.vx = (node.vx ?? 0) + dx * strength * alpha;
      node.vy = (node.vy ?? 0) + dy * strength * alpha;
    }
  };
}

/** Layout: connectivity forms groups around high-degree hubs; votes do not affect positions. */
export function layoutForceGraph(
  nodes: LayoutNode[],
  links: GraphLink[],
  centerVid: number,
  _maxVotes: number,
): LayoutNode[] {
  if (!nodes.length) return [];

  const hubVids = pickHubVids(nodes, centerVid);
  const hubOf = assignHubs(nodes, links, hubVids);

  const simNodes: SimNode[] = nodes.map((node) => ({
    ...node,
    x: 0,
    y: 0,
    hubVid: hubOf.get(node.vid) ?? node.vid,
  }));
  const nodeByVid = new Map(simNodes.map((n) => [n.vid, n]));

  seedHubLayout(simNodes, hubVids, hubOf);

  const simLinks: SimLink[] = links
    .map((link) => ({
      source: nodeByVid.get(link.fromVid)!,
      target: nodeByVid.get(link.toVid)!,
      votes: link.votes,
      kind: link.kind,
    }))
    .filter((l) => l.source && l.target);

  const simulation = forceSimulation(simNodes)
    .force(
      'link',
      forceLink<SimNode, SimLink>(simLinks)
        .id((node) => node.vid)
        .strength(LINK_STRENGTH)
        .distance((link) =>
          link.kind === 'mesh' ? MESH_LINK_DISTANCE : PRIMARY_LINK_DISTANCE,
        )
        .iterations(4),
    )
    .force(
      'charge',
      forceManyBody<SimNode>()
        .strength(-22)
        .distanceMax(200)
        .theta(0.85),
    )
    .force('center', forceCenter(0, 0).strength(0.01))
    .force('hub', forceHubGravity(simNodes, hubOf))
    .force(
      'collide',
      forceCollide<SimNode>()
        .radius((node) => 9 + Math.sqrt(node.degree) * 2.5)
        .strength(0.75)
        .iterations(2),
    )
    .stop();

  const ticks = Math.min(580, 200 + simNodes.length * 4);
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