import {
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
import {
  bookAbbrev,
  bookNodeVidToBookNum,
  bookNumToBookName,
  bookNumToNodeVid,
  isBookNodeVid,
  vidToBookNum,
} from './verse-id';

export type GraphLink = {
  fromVid: number;
  toVid: number;
  votes: number;
  kind: 'primary' | 'mesh' | 'book';
};

export type LayoutNodeKind = 'verse' | 'book';

export type LayoutNode = {
  vid: number;
  kind: LayoutNodeKind;
  bookNum?: number;
  bookName?: string;
  bookLabel?: string;
  isCenter: boolean;
  degree: number;
  weight: number;
  x: number;
  y: number;
};

type SimNode = SimulationNodeDatum & {
  vid: number;
  kind: LayoutNodeKind;
  bookNum?: number;
  isCenter: boolean;
  degree: number;
  weight: number;
  hubVid: number;
};

type SimLink = SimulationLinkDatum<SimNode> & {
  votes: number;
  kind: GraphLink['kind'];
};

const LINK_STRENGTH = 0.32;
const PRIMARY_LINK_DISTANCE = 36;
const MESH_LINK_DISTANCE = 28;
const BOOK_LINK_DISTANCE = 12;
const BOOK_LINK_STRENGTH = 0.95;
const BOOK_HUB_MIN_SPACING = 200;
const CROSS_BOOK_LINK_DISTANCE = 110;
const CENTER_SPOKE_LINK_DISTANCE = 130;

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

  const membersByBook = new Map<number, number[]>();
  for (const vid of degreeMap.keys()) {
    const bookNum = vidToBookNum(vid);
    const members = membersByBook.get(bookNum) ?? [];
    members.push(vid);
    membersByBook.set(bookNum, members);
  }

  const bookLinkCount = new Map<number, number>();
  for (const link of links) {
    if (link.kind === 'book') continue;
    const fromBook = vidToBookNum(link.fromVid);
    const toBook = vidToBookNum(link.toVid);
    bookLinkCount.set(fromBook, (bookLinkCount.get(fromBook) ?? 0) + 1);
    if (toBook !== fromBook) {
      bookLinkCount.set(toBook, (bookLinkCount.get(toBook) ?? 0) + 1);
    }
  }

  for (const [bookNum, members] of membersByBook) {
    const bookVid = bookNumToNodeVid(bookNum);
    degreeMap.set(bookVid, bookLinkCount.get(bookNum) ?? members.length);
    weightMap.set(bookVid, 0);
    for (const verseVid of members) {
      links.push({
        fromVid: verseVid,
        toVid: bookVid,
        votes: 0,
        kind: 'book',
      });
    }
  }

  const nodes: LayoutNode[] = [...degreeMap.keys()].map((vid) => {
    if (isBookNodeVid(vid)) {
      const bookNum = bookNodeVidToBookNum(vid);
      const bookName = bookNumToBookName(bookNum);
      return {
        vid,
        kind: 'book' as const,
        bookNum,
        bookName,
        bookLabel: bookAbbrev(bookName),
        isCenter: false,
        degree: degreeMap.get(vid) ?? 0,
        weight: 0,
        x: 0,
        y: 0,
      };
    }

    return {
      vid,
      kind: 'verse' as const,
      isCenter: vid === centerVid,
      degree: degreeMap.get(vid) ?? 0,
      weight: weightMap.get(vid) ?? 0,
      x: 0,
      y: 0,
    };
  });

  return { nodes, links };
}

function seedBookNodeLayout(simNodes: SimNode[]): Map<number, { x: number; y: number }> {
  const bookNodes = simNodes
    .filter((n) => n.kind === 'book')
    .sort((a, b) => (a.bookNum ?? 0) - (b.bookNum ?? 0));
  const count = bookNodes.length;
  const radius = Math.max(
    BOOK_HUB_MIN_SPACING * 1.4,
    (BOOK_HUB_MIN_SPACING * count) / (2 * Math.PI),
  );
  const anchors = new Map<number, { x: number; y: number }>();

  bookNodes.forEach((node, index) => {
    const angle = (2 * Math.PI * index) / Math.max(1, count) - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    node.x = x;
    node.y = y;
    anchors.set(node.vid, { x, y });
  });

  return anchors;
}

/** Place verses in a tight ring around their book hub before force simulation. */
function seedVerseByBookLayout(simNodes: SimNode[]): void {
  const bookByNum = new Map(
    simNodes.filter((n) => n.kind === 'book').map((n) => [n.bookNum ?? 0, n]),
  );
  const membersByBook = new Map<number, SimNode[]>();

  for (const node of simNodes) {
    if (node.kind !== 'verse') continue;
    const bookNum = vidToBookNum(node.vid);
    const members = membersByBook.get(bookNum) ?? [];
    members.push(node);
    membersByBook.set(bookNum, members);
  }

  for (const [bookNum, members] of membersByBook) {
    const book = bookByNum.get(bookNum);
    if (!book) continue;
    members.forEach((node, index) => {
      const angle = (2 * Math.PI * index) / Math.max(1, members.length);
      const orbit = 8 + Math.min(members.length, 18) * 1.1;
      node.x = (book.x ?? 0) + Math.cos(angle) * orbit;
      node.y = (book.y ?? 0) + Math.sin(angle) * orbit;
    });
  }
}

function forceBookAnchor(
  nodes: SimNode[],
  anchors: Map<number, { x: number; y: number }>,
) {
  const strength = 0.38;

  return (alpha: number) => {
    for (const node of nodes) {
      if (node.kind !== 'book') continue;
      const anchor = anchors.get(node.vid);
      if (!anchor) continue;
      const dx = anchor.x - (node.x ?? 0);
      const dy = anchor.y - (node.y ?? 0);
      node.vx = (node.vx ?? 0) + dx * strength * alpha;
      node.vy = (node.vy ?? 0) + dy * strength * alpha;
    }
  };
}

/** Keep book hubs well separated even when verse clusters grow. */
function crossRefLinkDistance(link: SimLink, centerVid: number): number {
  const source = link.source as SimNode;
  const target = link.target as SimNode;
  const fromVid = source.vid;
  const toVid = target.vid;
  const sameBook = vidToBookNum(fromVid) === vidToBookNum(toVid);
  const touchesCenter = fromVid === centerVid || toVid === centerVid;

  if (touchesCenter && !sameBook) return CENTER_SPOKE_LINK_DISTANCE;
  if (!sameBook) return CROSS_BOOK_LINK_DISTANCE;
  if (touchesCenter) return PRIMARY_LINK_DISTANCE + 8;
  return link.kind === 'mesh' ? MESH_LINK_DISTANCE : PRIMARY_LINK_DISTANCE;
}

function crossRefLinkStrength(link: SimLink, centerVid: number): number {
  const source = link.source as SimNode;
  const target = link.target as SimNode;
  const fromVid = source.vid;
  const toVid = target.vid;
  const sameBook = vidToBookNum(fromVid) === vidToBookNum(toVid);
  const touchesCenter = fromVid === centerVid || toVid === centerVid;

  if (touchesCenter && !sameBook) return 0.04;
  if (!sameBook) return 0.1;
  if (touchesCenter) return 0.18;
  return link.kind === 'mesh' ? 0.22 : LINK_STRENGTH;
}

/** Pull every verse toward its book hub so spokes do not collapse on the center verse. */
function forceVerseToBook(nodes: SimNode[]) {
  const strength = 0.35;
  const bookByNum = new Map(
    nodes.filter((n) => n.kind === 'book').map((n) => [n.bookNum ?? 0, n]),
  );

  return (alpha: number) => {
    for (const node of nodes) {
      if (node.kind !== 'verse') continue;
      const book = bookByNum.get(vidToBookNum(node.vid));
      if (!book) continue;
      const dx = (book.x ?? 0) - (node.x ?? 0);
      const dy = (book.y ?? 0) - (node.y ?? 0);
      node.vx = (node.vx ?? 0) + dx * strength * alpha;
      node.vy = (node.vy ?? 0) + dy * strength * alpha;
    }
  };
}

function forceBookRepel(nodes: SimNode[]) {
  return (alpha: number) => {
    const books = nodes.filter((n) => n.kind === 'book');
    for (let i = 0; i < books.length; i += 1) {
      for (let j = i + 1; j < books.length; j += 1) {
        const a = books[i];
        const b = books[j];
        const dx = (b.x ?? 0) - (a.x ?? 0);
        const dy = (b.y ?? 0) - (a.y ?? 0);
        const dist = Math.hypot(dx, dy) || 1;
        if (dist >= BOOK_HUB_MIN_SPACING) continue;
        const push = ((BOOK_HUB_MIN_SPACING - dist) / dist) * 2.8 * alpha;
        a.vx = (a.vx ?? 0) - dx * push;
        a.vy = (a.vy ?? 0) - dy * push;
        b.vx = (b.vx ?? 0) + dx * push;
        b.vy = (b.vy ?? 0) + dy * push;
      }
    }
  };
}

/** Layout: verses cluster around book hubs; cross-ref links shape local structure only. */
export function layoutForceGraph(
  nodes: LayoutNode[],
  links: GraphLink[],
  centerVid: number,
  _maxVotes: number,
): LayoutNode[] {
  if (!nodes.length) return [];

  const simNodes: SimNode[] = nodes.map((node) => ({
    ...node,
    x: 0,
    y: 0,
    hubVid: node.vid,
  }));
  const nodeByVid = new Map(simNodes.map((n) => [n.vid, n]));

  const bookAnchors = seedBookNodeLayout(simNodes);
  seedVerseByBookLayout(simNodes);

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
        .strength((link) =>
          link.kind === 'book' ? BOOK_LINK_STRENGTH : crossRefLinkStrength(link, centerVid),
        )
        .distance((link) =>
          link.kind === 'book' ? BOOK_LINK_DISTANCE : crossRefLinkDistance(link, centerVid),
        )
        .iterations(5),
    )
    .force(
      'charge',
      forceManyBody<SimNode>()
        .strength((node) => (node.kind === 'book' ? -160 : -8))
        .distanceMax(520)
        .theta(0.85),
    )
    .force('book-anchor', forceBookAnchor(simNodes, bookAnchors))
    .force('book-repel', forceBookRepel(simNodes))
    .force('verse-book', forceVerseToBook(simNodes))
    .force(
      'collide',
      forceCollide<SimNode>()
        .radius((node) =>
          node.kind === 'book' ? 10 + Math.sqrt(node.degree) * 1.1 : 7 + Math.sqrt(node.degree) * 2,
        )
        .strength(0.8)
        .iterations(2),
    )
    .stop();

  const ticks = Math.min(580, 200 + simNodes.length * 4);
  for (let i = 0; i < ticks; i += 1) simulation.tick();

  const scale = fitScale(simNodes, 480);
  return simNodes.map((node) => ({
    vid: node.vid,
    kind: node.kind,
    bookNum: node.bookNum,
    bookName: node.kind === 'book' ? bookNumToBookName(node.bookNum ?? 0) : undefined,
    bookLabel:
      node.kind === 'book' ? bookAbbrev(bookNumToBookName(node.bookNum ?? 0)) : undefined,
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
    if (node.kind === 'book') {
      const r = Math.hypot(node.x ?? 0, node.y ?? 0);
      if (r > maxR) maxR = r;
    }
  }
  for (const node of nodes) {
    if (node.kind !== 'verse') continue;
    const r = Math.hypot(node.x ?? 0, node.y ?? 0);
    if (r > maxR) maxR = r;
  }
  return targetRadius / maxR;
}