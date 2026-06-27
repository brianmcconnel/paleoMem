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
  chapterNodeVidToBookChapter,
  chapterToNodeVid,
  isBookNodeVid,
  isChapterNodeVid,
  vidToBookNum,
  vidToChapterNum,
} from './verse-id';

export type GraphLink = {
  fromVid: number;
  toVid: number;
  votes: number;
  kind: 'primary' | 'mesh' | 'book' | 'chapter';
};

export type LayoutNodeKind = 'verse' | 'book' | 'chapter';

export type LayoutNode = {
  vid: number;
  kind: LayoutNodeKind;
  bookNum?: number;
  chapterNum?: number;
  bookName?: string;
  bookLabel?: string;
  chapterLabel?: string;
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
  chapterNum?: number;
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
const CHAPTER_LINK_DISTANCE = 9;
const CHAPTER_LINK_STRENGTH = 0.92;
const BOOK_CHAPTER_LINK_DISTANCE = 24;
const BOOK_CHAPTER_LINK_STRENGTH = 0.78;
const BOOK_HUB_MIN_SPACING = 200;
const CROSS_BOOK_LINK_DISTANCE = 110;
const CENTER_SPOKE_LINK_DISTANCE = 130;

function chapterKey(bookNum: number, chapter: number): string {
  return `${bookNum}:${chapter}`;
}

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

  const membersByChapter = new Map<string, number[]>();
  for (const vid of degreeMap.keys()) {
    const bookNum = vidToBookNum(vid);
    const chapter = vidToChapterNum(vid);
    const key = chapterKey(bookNum, chapter);
    const members = membersByChapter.get(key) ?? [];
    members.push(vid);
    membersByChapter.set(key, members);
  }

  const bookLinkCount = new Map<number, number>();
  for (const link of links) {
    if (link.kind === 'book' || link.kind === 'chapter') continue;
    const fromBook = vidToBookNum(link.fromVid);
    const toBook = vidToBookNum(link.toVid);
    bookLinkCount.set(fromBook, (bookLinkCount.get(fromBook) ?? 0) + 1);
    if (toBook !== fromBook) {
      bookLinkCount.set(toBook, (bookLinkCount.get(toBook) ?? 0) + 1);
    }
  }

  const chaptersByBook = new Map<number, number[]>();

  for (const [key, members] of membersByChapter) {
    const [bookNumStr, chapterStr] = key.split(':');
    const bookNum = Number(bookNumStr);
    const chapter = Number(chapterStr);
    const chapterVid = chapterToNodeVid(bookNum, chapter);
    degreeMap.set(chapterVid, members.length);
    weightMap.set(chapterVid, 0);

    const bookChapters = chaptersByBook.get(bookNum) ?? [];
    bookChapters.push(chapter);
    chaptersByBook.set(bookNum, bookChapters);

    for (const verseVid of members) {
      links.push({
        fromVid: verseVid,
        toVid: chapterVid,
        votes: 0,
        kind: 'chapter',
      });
    }
  }

  for (const [bookNum, chapters] of chaptersByBook) {
    const bookVid = bookNumToNodeVid(bookNum);
    degreeMap.set(bookVid, bookLinkCount.get(bookNum) ?? chapters.length);
    weightMap.set(bookVid, 0);
    for (const chapter of chapters) {
      links.push({
        fromVid: chapterToNodeVid(bookNum, chapter),
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

    if (isChapterNodeVid(vid)) {
      const { bookNum, chapter } = chapterNodeVidToBookChapter(vid);
      return {
        vid,
        kind: 'chapter' as const,
        bookNum,
        chapterNum: chapter,
        chapterLabel: String(chapter),
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
      bookNum: vidToBookNum(vid),
      chapterNum: vidToChapterNum(vid),
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

function seedChapterByBookLayout(simNodes: SimNode[]): void {
  const bookByNum = new Map(
    simNodes.filter((n) => n.kind === 'book').map((n) => [n.bookNum ?? 0, n]),
  );
  const chaptersByBook = new Map<number, SimNode[]>();

  for (const node of simNodes) {
    if (node.kind !== 'chapter') continue;
    const bookNum = node.bookNum ?? 0;
    const group = chaptersByBook.get(bookNum) ?? [];
    group.push(node);
    chaptersByBook.set(bookNum, group);
  }

  for (const [bookNum, chapters] of chaptersByBook) {
    const book = bookByNum.get(bookNum);
    if (!book) continue;
    chapters.sort((a, b) => (a.chapterNum ?? 0) - (b.chapterNum ?? 0));
    chapters.forEach((node, index) => {
      const angle = (2 * Math.PI * index) / Math.max(1, chapters.length);
      const orbit = 28 + Math.min(chapters.length, 12) * 2.2;
      node.x = (book.x ?? 0) + Math.cos(angle) * orbit;
      node.y = (book.y ?? 0) + Math.sin(angle) * orbit;
    });
  }
}

function seedVerseByChapterLayout(simNodes: SimNode[]): void {
  const chapterByVid = new Map(
    simNodes.filter((n) => n.kind === 'chapter').map((n) => [n.vid, n]),
  );
  const membersByChapter = new Map<number, SimNode[]>();

  for (const node of simNodes) {
    if (node.kind !== 'verse') continue;
    const chapterVid = chapterToNodeVid(node.bookNum ?? vidToBookNum(node.vid), node.chapterNum ?? vidToChapterNum(node.vid));
    const members = membersByChapter.get(chapterVid) ?? [];
    members.push(node);
    membersByChapter.set(chapterVid, members);
  }

  for (const [chapterVid, members] of membersByChapter) {
    const chapter = chapterByVid.get(chapterVid);
    if (!chapter) continue;
    members.forEach((node, index) => {
      const angle = (2 * Math.PI * index) / Math.max(1, members.length);
      const orbit = 7 + Math.min(members.length, 14) * 1.0;
      node.x = (chapter.x ?? 0) + Math.cos(angle) * orbit;
      node.y = (chapter.y ?? 0) + Math.sin(angle) * orbit;
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

function membershipLinkStrength(link: SimLink): number {
  if (link.kind === 'chapter') return CHAPTER_LINK_STRENGTH;
  if (link.kind === 'book') return BOOK_CHAPTER_LINK_STRENGTH;
  return LINK_STRENGTH;
}

function membershipLinkDistance(link: SimLink): number {
  if (link.kind === 'chapter') return CHAPTER_LINK_DISTANCE;
  if (link.kind === 'book') return BOOK_CHAPTER_LINK_DISTANCE;
  return PRIMARY_LINK_DISTANCE;
}

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

function forceVerseToChapter(nodes: SimNode[]) {
  const strength = 0.32;
  const chapterByVid = new Map(
    nodes.filter((n) => n.kind === 'chapter').map((n) => [n.vid, n]),
  );

  return (alpha: number) => {
    for (const node of nodes) {
      if (node.kind !== 'verse') continue;
      const chapterVid = chapterToNodeVid(
        node.bookNum ?? vidToBookNum(node.vid),
        node.chapterNum ?? vidToChapterNum(node.vid),
      );
      const chapter = chapterByVid.get(chapterVid);
      if (!chapter) continue;
      const dx = (chapter.x ?? 0) - (node.x ?? 0);
      const dy = (chapter.y ?? 0) - (node.y ?? 0);
      node.vx = (node.vx ?? 0) + dx * strength * alpha;
      node.vy = (node.vy ?? 0) + dy * strength * alpha;
    }
  };
}

function forceChapterToBook(nodes: SimNode[]) {
  const strength = 0.28;
  const bookByNum = new Map(
    nodes.filter((n) => n.kind === 'book').map((n) => [n.bookNum ?? 0, n]),
  );

  return (alpha: number) => {
    for (const node of nodes) {
      if (node.kind !== 'chapter') continue;
      const book = bookByNum.get(node.bookNum ?? 0);
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

function hubCollideRadius(node: SimNode): number {
  if (node.kind === 'book') return 10 + Math.sqrt(node.degree) * 1.1;
  if (node.kind === 'chapter') return 7 + Math.sqrt(node.degree) * 1.2;
  return 7 + Math.sqrt(node.degree) * 2;
}

function hubChargeStrength(node: SimNode): number {
  if (node.kind === 'book') return -160;
  if (node.kind === 'chapter') return -36;
  return -8;
}

/** Layout: book → chapter → verse hierarchy with cross-ref links shaping local clusters. */
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
  seedChapterByBookLayout(simNodes);
  seedVerseByChapterLayout(simNodes);

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
          link.kind === 'primary' || link.kind === 'mesh'
            ? crossRefLinkStrength(link, centerVid)
            : membershipLinkStrength(link),
        )
        .distance((link) =>
          link.kind === 'primary' || link.kind === 'mesh'
            ? crossRefLinkDistance(link, centerVid)
            : membershipLinkDistance(link),
        )
        .iterations(5),
    )
    .force(
      'charge',
      forceManyBody<SimNode>()
        .strength((node) => hubChargeStrength(node))
        .distanceMax(520)
        .theta(0.85),
    )
    .force('book-anchor', forceBookAnchor(simNodes, bookAnchors))
    .force('book-repel', forceBookRepel(simNodes))
    .force('verse-chapter', forceVerseToChapter(simNodes))
    .force('chapter-book', forceChapterToBook(simNodes))
    .force(
      'collide',
      forceCollide<SimNode>()
        .radius((node) => hubCollideRadius(node))
        .strength(0.8)
        .iterations(2),
    )
    .stop();

  const ticks = Math.min(580, 200 + simNodes.length * 4);
  for (let i = 0; i < ticks; i += 1) simulation.tick();

  const scale = fitScale(simNodes, 480);
  return simNodes.map((node) => {
    const bookName =
      node.kind === 'book' ? bookNumToBookName(node.bookNum ?? 0) : undefined;
    return {
      vid: node.vid,
      kind: node.kind,
      bookNum: node.bookNum,
      chapterNum: node.chapterNum,
      bookName,
      bookLabel: bookName ? bookAbbrev(bookName) : undefined,
      chapterLabel: node.kind === 'chapter' ? String(node.chapterNum ?? '') : undefined,
      isCenter: node.isCenter,
      degree: node.degree,
      weight: node.weight,
      x: (node.x ?? 0) * scale,
      y: (node.y ?? 0) * scale,
    };
  });
}

function fitScale(nodes: SimNode[], targetRadius: number): number {
  let maxR = 1;
  for (const node of nodes) {
    if (node.kind === 'book' || node.kind === 'chapter') {
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