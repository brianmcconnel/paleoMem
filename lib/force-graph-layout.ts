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
  verseToChapterNodeVid,
  vidToBookNum,
  vidToChapterNum,
  vidToVerseNum,
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
const PRIMARY_LINK_DISTANCE = 42;
const MESH_LINK_DISTANCE = 34;
const CHAPTER_LINK_DISTANCE = 14;
const CHAPTER_LINK_STRENGTH = 0.92;
const BOOK_CHAPTER_LINK_DISTANCE = 30;
const BOOK_CHAPTER_LINK_STRENGTH = 0.78;
const CHAPTER_RING_ARC_SPACING = 34;
const CHAPTER_RING_MIN_ORBIT = 36;
const CHAPTER_RING_ANCHOR_STRENGTH = 0.62;
const VERSE_ARC_OFFSET = 16;
const VERSE_ARC_GROWTH = 1.3;
const VERSE_ARC_MAX_SPAN = Math.PI * 0.5;
const VERSE_ARC_RADIAL_SPACING = 0.14;
const VERSE_ARC_ANCHOR_STRENGTH = 0.92;
const VERSE_NODE_GAP = 3;
const VERSE_RELAX_ITERATIONS = 32;
const VERSE_RELAX_CUTOFF = 96;
const VERSE_DEGREE_ORBIT_MAX = 32;
const VERSE_DEGREE_ORBIT_SQRT = 2.2;
const VERSE_ZOOM_ORBIT_GAIN = 0.45;
const BOOK_HUB_MIN_SPACING = 200;
const BOOK_INNER_RING_PADDING = 52;
const BOOK_RING_GAP = 130;
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

function centerBookClusterRadius(simNodes: SimNode[], centerBookNum: number): number {
  const chapters = simNodes.filter(
    (n) => n.kind === 'chapter' && n.bookNum === centerBookNum,
  );
  const chapterOrbit = chapterRingOrbit(chapters.length);

  let maxVersesInChapter = 1;
  for (const chapter of chapters) {
    const chapterVid = chapter.vid;
    const verseCount = simNodes.filter(
      (n) =>
        n.kind === 'verse' &&
        chapterToNodeVid(n.bookNum ?? 0, n.chapterNum ?? 0) === chapterVid,
    ).length;
    maxVersesInChapter = Math.max(maxVersesInChapter, verseCount);
  }

  return chapterOrbit + verseArcOrbit(maxVersesInChapter) + 28;
}

function bookRingRadius(
  bookCount: number,
  minRadius: number,
  arcSpacing: number,
): number {
  if (bookCount <= 0) return minRadius;
  return Math.max(minRadius, (arcSpacing * bookCount) / (2 * Math.PI));
}

function placeBooksOnRing(
  books: SimNode[],
  radius: number,
  anchors: Map<number, { x: number; y: number }>,
  angleOffset = 0,
): void {
  if (!books.length) return;
  books.forEach((node, index) => {
    const angle =
      (2 * Math.PI * index) / books.length - Math.PI / 2 + angleOffset;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    node.x = x;
    node.y = y;
    anchors.set(node.vid, { x, y });
  });
}

function seedBookNodeLayout(
  simNodes: SimNode[],
  centerVid: number,
): Map<number, { x: number; y: number }> {
  const centerBookNum = vidToBookNum(centerVid);
  const bookNodes = simNodes.filter((n) => n.kind === 'book');
  const centerBook = bookNodes.find((n) => n.bookNum === centerBookNum);
  const otherBooks = bookNodes.filter((n) => n.bookNum !== centerBookNum);

  const anchors = new Map<number, { x: number; y: number }>();

  if (centerBook) {
    centerBook.x = 0;
    centerBook.y = 0;
    anchors.set(centerBook.vid, { x: 0, y: 0 });
  }

  if (!otherBooks.length) return anchors;

  const byCrossRefs = [...otherBooks].sort(
    (a, b) => (b.degree - a.degree) || (a.bookNum ?? 0) - (b.bookNum ?? 0),
  );
  const innerCount = Math.ceil(byCrossRefs.length / 2);
  const innerBooks = byCrossRefs.slice(0, innerCount);
  const outerBooks = byCrossRefs.slice(innerCount);

  const clusterRadius = centerBookClusterRadius(simNodes, centerBookNum);
  const innerRadius = bookRingRadius(
    innerBooks.length,
    clusterRadius + BOOK_INNER_RING_PADDING,
    BOOK_HUB_MIN_SPACING * 0.65,
  );
  const outerRadius = bookRingRadius(
    outerBooks.length,
    innerRadius + BOOK_RING_GAP,
    BOOK_HUB_MIN_SPACING,
  );

  placeBooksOnRing(innerBooks, innerRadius, anchors);

  const stagger =
    innerBooks.length > 0 && outerBooks.length > 0
      ? Math.PI / Math.max(innerBooks.length, outerBooks.length)
      : 0;
  placeBooksOnRing(outerBooks, outerRadius, anchors, stagger);

  return anchors;
}

function chapterRingOrbit(chapterCount: number): number {
  if (chapterCount <= 1) return CHAPTER_RING_MIN_ORBIT;
  const arcOrbit = (chapterCount * CHAPTER_RING_ARC_SPACING) / (2 * Math.PI);
  return Math.max(CHAPTER_RING_MIN_ORBIT, arcOrbit);
}

function chapterRingAngle(
  index: number,
  chapterCount: number,
  rotation = 0,
): number {
  return (2 * Math.PI * index) / Math.max(1, chapterCount) - Math.PI / 2 + rotation;
}

function centerChapterRingRotation(
  chapters: SimNode[],
  centerChapterNum: number,
): number {
  const index = chapters.findIndex((c) => c.chapterNum === centerChapterNum);
  if (index < 0) return 0;
  return (-2 * Math.PI * index) / Math.max(1, chapters.length);
}

function chapterRingRotationForBook(
  bookNum: number,
  chapters: SimNode[],
  centerBookNum: number,
  centerChapterNum: number,
): number {
  if (bookNum !== centerBookNum) return 0;
  return centerChapterRingRotation(chapters, centerChapterNum);
}

function chaptersByBookMap(nodes: SimNode[]): Map<number, SimNode[]> {
  const chaptersByBook = new Map<number, SimNode[]>();
  for (const node of nodes) {
    if (node.kind !== 'chapter') continue;
    const bookNum = node.bookNum ?? 0;
    const group = chaptersByBook.get(bookNum) ?? [];
    group.push(node);
    chaptersByBook.set(bookNum, group);
  }
  for (const chapters of chaptersByBook.values()) {
    chapters.sort((a, b) => (a.chapterNum ?? 0) - (b.chapterNum ?? 0));
  }
  return chaptersByBook;
}

function chapterRingPosition(
  bookX: number,
  bookY: number,
  index: number,
  chapterCount: number,
  rotation = 0,
): { x: number; y: number } {
  const orbit = chapterRingOrbit(chapterCount);
  const angle = chapterRingAngle(index, chapterCount, rotation);
  return {
    x: bookX + Math.cos(angle) * orbit,
    y: bookY + Math.sin(angle) * orbit,
  };
}

function seedChapterByBookLayout(simNodes: SimNode[], centerVid: number): void {
  const centerBookNum = vidToBookNum(centerVid);
  const centerChapterNum = vidToChapterNum(centerVid);
  const bookByNum = new Map(
    simNodes.filter((n) => n.kind === 'book').map((n) => [n.bookNum ?? 0, n]),
  );

  for (const [bookNum, chapters] of chaptersByBookMap(simNodes)) {
    const book = bookByNum.get(bookNum);
    if (!book) continue;
    const bx = book.x ?? 0;
    const by = book.y ?? 0;
    const rotation = chapterRingRotationForBook(
      bookNum,
      chapters,
      centerBookNum,
      centerChapterNum,
    );
    chapters.forEach((node, index) => {
      const pos = chapterRingPosition(bx, by, index, chapters.length, rotation);
      node.x = pos.x;
      node.y = pos.y;
    });
  }
}

/** Matches deck.gl scatter radius in CrossRefGraph (degree → pixel radius). */
export function verseNodeRadius(degree: number): number {
  return 3 + Math.sqrt(degree) * 1.25;
}

function maxVerseDegree(nodes: Pick<LayoutNode, 'kind' | 'degree'>[]): number {
  let max = 1;
  for (const node of nodes) {
    if (node.kind !== 'verse') continue;
    max = Math.max(max, node.degree);
  }
  return max;
}

/** Radial distance from chapter hub: farther when degree is high and zoom is magnified. */
export function verseRadialOffsetFromChapter(
  chapterBaseOrbit: number,
  degree: number,
  maxDegree: number,
  zoom: number,
  layoutZoom: number,
): number {
  const degreeNorm = maxDegree > 0 ? degree / maxDegree : 0;
  const degreeOffset =
    degreeNorm * VERSE_DEGREE_ORBIT_MAX + Math.sqrt(degree) * VERSE_DEGREE_ORBIT_SQRT;
  const zoomScale = 2 ** ((zoom - layoutZoom) * VERSE_ZOOM_ORBIT_GAIN);
  return chapterBaseOrbit * zoomScale + degreeOffset;
}

function clampVerseArcAngle(
  angle: number,
  outward: number,
  angularSpan: number,
): number {
  if (angularSpan <= 0) return outward;
  let delta = angle - outward;
  while (delta > Math.PI) delta -= 2 * Math.PI;
  while (delta < -Math.PI) delta += 2 * Math.PI;
  const half = angularSpan / 2;
  delta = Math.max(-half, Math.min(half, delta));
  return outward + delta;
}

function outwardAngle(bookX: number, bookY: number, chapterX: number, chapterY: number): number {
  return Math.atan2(chapterY - bookY, chapterX - bookX);
}

type VerseArcMetrics = {
  outward: number;
  effectiveOrbit: number;
  angularSpan: number;
  radii: number[];
  gaps: number[];
};

function verseArcMetrics(
  members: SimNode[],
  bookX: number,
  bookY: number,
  chapterX: number,
  chapterY: number,
): VerseArcMetrics {
  const outward = outwardAngle(bookX, bookY, chapterX, chapterY);
  const count = members.length;
  const radii = members.map((member) => verseNodeRadius(member.degree));
  const baseOrbit = verseArcOrbit(count);

  if (count <= 1) {
    const loneRadius = radii[0] ?? verseNodeRadius(0);
    return {
      outward,
      effectiveOrbit: baseOrbit + loneRadius * 0.2,
      angularSpan: 0,
      radii,
      gaps: [],
    };
  }

  const gaps: number[] = [];
  for (let i = 0; i < count - 1; i += 1) {
    gaps.push(radii[i] / 2 + radii[i + 1] / 2 + VERSE_NODE_GAP);
  }
  const totalSpan = gaps.reduce((sum, gap) => sum + gap, 0);
  const angularSpan = Math.min(VERSE_ARC_MAX_SPAN, totalSpan / baseOrbit);
  const effectiveOrbit = Math.max(baseOrbit, totalSpan / angularSpan);

  return { outward, effectiveOrbit, angularSpan, radii, gaps };
}

function verseArcAngleForIndex(metrics: VerseArcMetrics, index: number): number {
  if (metrics.radii.length <= 1) return metrics.outward;
  const startAngle = metrics.outward - metrics.angularSpan / 2;
  let arcOffset = metrics.radii[0];
  for (let i = 0; i < index; i += 1) {
    if (i > 0) arcOffset += metrics.gaps[i - 1];
  }
  if (index > 0) arcOffset += metrics.gaps[index - 1];
  return startAngle + arcOffset / metrics.effectiveOrbit;
}

function verseArcPoint(
  metrics: VerseArcMetrics,
  index: number,
  member: SimNode,
  chapterX: number,
  chapterY: number,
  maxDegree: number,
  zoom: number,
  layoutZoom: number,
): { x: number; y: number } {
  const angle = verseArcAngleForIndex(metrics, index);
  const orbit = verseRadialOffsetFromChapter(
    metrics.effectiveOrbit,
    member.degree,
    maxDegree,
    zoom,
    layoutZoom,
  );
  return {
    x: chapterX + Math.cos(angle) * orbit,
    y: chapterY + Math.sin(angle) * orbit,
  };
}

function spreadVersesOnChapterArc(
  members: SimNode[],
  chapterX: number,
  chapterY: number,
  bookX: number,
  bookY: number,
  maxDegree: number,
  zoom = 0,
  layoutZoom = 0,
): void {
  const metrics = verseArcMetrics(members, bookX, bookY, chapterX, chapterY);

  members.forEach((node, index) => {
    const pos = verseArcPoint(
      metrics,
      index,
      node,
      chapterX,
      chapterY,
      maxDegree,
      zoom,
      layoutZoom,
    );
    node.x = pos.x;
    node.y = pos.y;
  });
}

function relaxVerseNeighbors(simNodes: SimNode[]): void {
  const verses = simNodes.filter((node) => node.kind === 'verse');
  const cutoffSq = VERSE_RELAX_CUTOFF * VERSE_RELAX_CUTOFF;

  for (let iter = 0; iter < VERSE_RELAX_ITERATIONS; iter += 1) {
    for (let i = 0; i < verses.length; i += 1) {
      const a = verses[i];
      const ax = a.x ?? 0;
      const ay = a.y ?? 0;
      const ra = verseNodeRadius(a.degree);

      for (let j = i + 1; j < verses.length; j += 1) {
        const b = verses[j];
        const bx = b.x ?? 0;
        const by = b.y ?? 0;
        const dx = bx - ax;
        const dy = by - ay;
        const distSq = dx * dx + dy * dy;
        if (distSq > cutoffSq) continue;

        const rb = verseNodeRadius(b.degree);
        const minDist = ra + rb + VERSE_NODE_GAP;
        const dist = Math.sqrt(distSq) || 0.001;
        if (dist >= minDist) continue;

        const push = ((minDist - dist) / dist) * 0.55;
        a.x = (a.x ?? 0) - dx * push;
        a.y = (a.y ?? 0) - dy * push;
        b.x = (b.x ?? 0) + dx * push;
        b.y = (b.y ?? 0) + dy * push;
      }
    }
  }
}

function constrainVersesToOutwardArcs(simNodes: SimNode[], maxDegree: number): void {
  const chapterByVid = new Map(
    simNodes.filter((n) => n.kind === 'chapter').map((n) => [n.vid, n]),
  );
  const bookByNum = new Map(
    simNodes.filter((n) => n.kind === 'book').map((n) => [n.bookNum ?? 0, n]),
  );

  for (const [chapterVid, members] of versesByChapterMap(simNodes)) {
    const chapter = chapterByVid.get(chapterVid);
    if (!chapter) continue;
    const bookNum =
      chapter.bookNum ?? chapterNodeVidToBookChapter(chapterVid).bookNum;
    const book = bookByNum.get(bookNum);
    const bx = book?.x ?? 0;
    const by = book?.y ?? 0;
    const cx = chapter.x ?? 0;
    const cy = chapter.y ?? 0;
    const { outward, effectiveOrbit, angularSpan } = verseArcMetrics(
      members,
      bx,
      by,
      cx,
      cy,
    );

    for (const node of members) {
      const dx = (node.x ?? 0) - cx;
      const dy = (node.y ?? 0) - cy;
      const angle = clampVerseArcAngle(Math.atan2(dy, dx), outward, angularSpan);
      const minDist = verseRadialOffsetFromChapter(
        effectiveOrbit,
        node.degree,
        maxDegree,
        0,
        0,
      );
      const dist = Math.max(minDist, Math.hypot(dx, dy));
      node.x = cx + Math.cos(angle) * dist;
      node.y = cy + Math.sin(angle) * dist;
    }
  }
}

function layoutVersesNearChapters(simNodes: SimNode[]): void {
  const maxDegree = maxVerseDegree(simNodes);
  seedVerseByChapterLayout(simNodes, maxDegree);
  relaxVerseNeighbors(simNodes);
  constrainVersesToOutwardArcs(simNodes, maxDegree);
}

/** Re-seat verses on their chapter arcs using link count and current graph zoom. */
export function applyVerseSpacingByDegreeAndZoom(
  nodes: LayoutNode[],
  zoom: number,
  layoutZoom: number,
): LayoutNode[] {
  const maxDegree = maxVerseDegree(nodes);
  const chapterByVid = new Map(
    nodes.filter((n) => n.kind === 'chapter').map((n) => [n.vid, n]),
  );
  const bookByNum = new Map(
    nodes.filter((n) => n.kind === 'book').map((n) => [n.bookNum ?? 0, n]),
  );
  const membersByChapter = versesByChapterMap(nodes as SimNode[]);

  return nodes.map((node) => {
    if (node.kind !== 'verse') return node;

    const chapterVid = verseToChapterNodeVid(node.vid);
    const chapter = chapterByVid.get(chapterVid);
    if (!chapter) return node;

    const members = membersByChapter.get(chapterVid);
    if (!members?.length) return node;

    const bookNum =
      chapter.bookNum ?? chapterNodeVidToBookChapter(chapterVid).bookNum;
    const book = bookByNum.get(bookNum);
    const bx = book?.x ?? 0;
    const by = book?.y ?? 0;
    const cx = chapter.x;
    const cy = chapter.y;
    const { outward, effectiveOrbit, angularSpan } = verseArcMetrics(
      members as SimNode[],
      bx,
      by,
      cx,
      cy,
    );

    const dx = node.x - cx;
    const dy = node.y - cy;
    const angle = clampVerseArcAngle(Math.atan2(dy, dx), outward, angularSpan);
    const orbit = verseRadialOffsetFromChapter(
      effectiveOrbit,
      node.degree,
      maxDegree,
      zoom,
      layoutZoom,
    );

    return {
      ...node,
      x: cx + Math.cos(angle) * orbit,
      y: cy + Math.sin(angle) * orbit,
    };
  });
}

function verseArcSpan(verseCount: number): number {
  if (verseCount <= 1) return 0;
  return Math.min(VERSE_ARC_MAX_SPAN, (verseCount - 1) * VERSE_ARC_RADIAL_SPACING);
}

function verseArcOrbit(verseCount: number): number {
  return VERSE_ARC_OFFSET + Math.min(verseCount, 14) * VERSE_ARC_GROWTH;
}

function verseArcAngle(outward: number, index: number, verseCount: number): number {
  if (verseCount <= 1) return outward;
  const span = verseArcSpan(verseCount);
  return outward - span / 2 + (span * index) / (verseCount - 1);
}

function verseArcPosition(
  chapterX: number,
  chapterY: number,
  bookX: number,
  bookY: number,
  index: number,
  verseCount: number,
): { x: number; y: number } {
  const outward = outwardAngle(bookX, bookY, chapterX, chapterY);
  const angle = verseArcAngle(outward, index, verseCount);
  const orbit = verseArcOrbit(verseCount);
  return {
    x: chapterX + Math.cos(angle) * orbit,
    y: chapterY + Math.sin(angle) * orbit,
  };
}

function versesByChapterMap(nodes: SimNode[]): Map<number, SimNode[]> {
  const membersByChapter = new Map<number, SimNode[]>();

  for (const node of nodes) {
    if (node.kind !== 'verse') continue;
    const chapterVid = chapterToNodeVid(
      node.bookNum ?? vidToBookNum(node.vid),
      node.chapterNum ?? vidToChapterNum(node.vid),
    );
    const members = membersByChapter.get(chapterVid) ?? [];
    members.push(node);
    membersByChapter.set(chapterVid, members);
  }

  for (const members of membersByChapter.values()) {
    members.sort((a, b) => vidToVerseNum(a.vid) - vidToVerseNum(b.vid));
  }

  return membersByChapter;
}

function seedVerseByChapterLayout(simNodes: SimNode[], maxDegree: number): void {
  const chapterByVid = new Map(
    simNodes.filter((n) => n.kind === 'chapter').map((n) => [n.vid, n]),
  );
  const bookByNum = new Map(
    simNodes.filter((n) => n.kind === 'book').map((n) => [n.bookNum ?? 0, n]),
  );

  for (const [chapterVid, members] of versesByChapterMap(simNodes)) {
    const chapter = chapterByVid.get(chapterVid);
    if (!chapter) continue;
    const bookNum =
      chapter.bookNum ?? chapterNodeVidToBookChapter(chapterVid).bookNum;
    const book = bookByNum.get(bookNum);
    const bx = book?.x ?? 0;
    const by = book?.y ?? 0;
    const cx = chapter.x ?? 0;
    const cy = chapter.y ?? 0;

    spreadVersesOnChapterArc(members, cx, cy, bx, by, maxDegree);
  }
}

function forceBookAnchor(
  nodes: SimNode[],
  anchors: Map<number, { x: number; y: number }>,
  centerVid: number,
) {
  const centerBookVid = bookNumToNodeVid(vidToBookNum(centerVid));

  return (alpha: number) => {
    for (const node of nodes) {
      if (node.kind !== 'book') continue;
      const anchor = anchors.get(node.vid);
      if (!anchor) continue;
      const strength = node.vid === centerBookVid ? 0.55 : 0.38;
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

/** Keep verses on an outward arc beyond their chapter hub (away from the book). */
function forceVerseArcAnchor(nodes: SimNode[]) {
  const maxDegree = maxVerseDegree(nodes);
  const chapterByVid = new Map(
    nodes.filter((n) => n.kind === 'chapter').map((n) => [n.vid, n]),
  );
  const bookByNum = new Map(
    nodes.filter((n) => n.kind === 'book').map((n) => [n.bookNum ?? 0, n]),
  );
  const versesByChapter = versesByChapterMap(nodes);

  return (alpha: number) => {
    for (const [chapterVid, members] of versesByChapter) {
      const chapter = chapterByVid.get(chapterVid);
      if (!chapter) continue;
      const bookNum =
        chapter.bookNum ?? chapterNodeVidToBookChapter(chapterVid).bookNum;
      const book = bookByNum.get(bookNum);
      const bx = book?.x ?? 0;
      const by = book?.y ?? 0;
      const cx = chapter.x ?? 0;
      const cy = chapter.y ?? 0;
      const metrics = verseArcMetrics(members, bx, by, cx, cy);

      members.forEach((node, index) => {
        const anchor = verseArcPoint(
          metrics,
          index,
          node,
          cx,
          cy,
          maxDegree,
          0,
          0,
        );
        const dx = anchor.x - (node.x ?? 0);
        const dy = anchor.y - (node.y ?? 0);
        node.vx = (node.vx ?? 0) + dx * VERSE_ARC_ANCHOR_STRENGTH * alpha;
        node.vy = (node.vy ?? 0) + dy * VERSE_ARC_ANCHOR_STRENGTH * alpha;
      });
    }
  };
}

/** Keep chapters on an even ring around each book's current position. */
function forceChapterRingAnchor(nodes: SimNode[], centerVid: number) {
  const centerBookNum = vidToBookNum(centerVid);
  const centerChapterNum = vidToChapterNum(centerVid);
  const bookByNum = new Map(
    nodes.filter((n) => n.kind === 'book').map((n) => [n.bookNum ?? 0, n]),
  );
  const chaptersByBook = chaptersByBookMap(nodes);

  return (alpha: number) => {
    for (const [bookNum, chapters] of chaptersByBook) {
      const book = bookByNum.get(bookNum);
      if (!book) continue;
      const bx = book.x ?? 0;
      const by = book.y ?? 0;
      const count = chapters.length;
      const rotation = chapterRingRotationForBook(
        bookNum,
        chapters,
        centerBookNum,
        centerChapterNum,
      );

      chapters.forEach((node, index) => {
        const anchor = chapterRingPosition(bx, by, index, count, rotation);
        const dx = anchor.x - (node.x ?? 0);
        const dy = anchor.y - (node.y ?? 0);
        node.vx = (node.vx ?? 0) + dx * CHAPTER_RING_ANCHOR_STRENGTH * alpha;
        node.vy = (node.vy ?? 0) + dy * CHAPTER_RING_ANCHOR_STRENGTH * alpha;
      });
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
        const push = ((BOOK_HUB_MIN_SPACING - dist) / dist) * 3.4 * alpha;
        a.vx = (a.vx ?? 0) - dx * push;
        a.vy = (a.vy ?? 0) - dy * push;
        b.vx = (b.vx ?? 0) + dx * push;
        b.vy = (b.vy ?? 0) + dy * push;
      }
    }
  };
}

function hubCollideRadius(node: SimNode): number {
  if (node.kind === 'book') return 14 + Math.sqrt(node.degree) * 1.4;
  if (node.kind === 'chapter') return 11 + Math.sqrt(node.degree) * 1.6;
  return 11 + Math.sqrt(node.degree) * 2.8;
}

function hubChargeStrength(node: SimNode): number {
  if (node.kind === 'verse') return 0;
  if (node.kind === 'book') return -240;
  if (node.kind === 'chapter') return -88;
  return 0;
}

/** Pairwise repulsion when nodes overlap their collision radii (local, cutoff for perf). */
function forceNodeRepel(nodes: SimNode[]) {
  const cutoff = 140;
  const cutoffSq = cutoff * cutoff;
  const strength = 2.6;

  return (alpha: number) => {
    for (let i = 0; i < nodes.length; i += 1) {
      const a = nodes[i];
      const ax = a.x ?? 0;
      const ay = a.y ?? 0;
      const ra = hubCollideRadius(a);

      for (let j = i + 1; j < nodes.length; j += 1) {
        const b = nodes[j];
        if (
          a.kind === 'chapter' &&
          b.kind === 'chapter' &&
          a.bookNum === b.bookNum
        ) {
          continue;
        }
        if (
          a.kind === 'verse' &&
          b.kind === 'verse' &&
          a.bookNum === b.bookNum &&
          a.chapterNum === b.chapterNum
        ) {
          continue;
        }
        if (
          (a.kind === 'verse' && b.kind === 'chapter' && a.bookNum === b.bookNum) ||
          (a.kind === 'chapter' && b.kind === 'verse' && a.bookNum === b.bookNum)
        ) {
          continue;
        }
        if (a.kind === 'verse' || b.kind === 'verse') {
          continue;
        }
        const bx = b.x ?? 0;
        const by = b.y ?? 0;
        const dx = bx - ax;
        const dy = by - ay;
        const distSq = dx * dx + dy * dy;
        if (distSq > cutoffSq) continue;

        const minDist = ra + hubCollideRadius(b);
        const dist = Math.sqrt(distSq) || 0.001;
        if (dist >= minDist) continue;

        const push = ((minDist - dist) / dist) * strength * alpha;
        a.vx = (a.vx ?? 0) - dx * push;
        a.vy = (a.vy ?? 0) - dy * push;
        b.vx = (b.vx ?? 0) + dx * push;
        b.vy = (b.vy ?? 0) + dy * push;
      }
    }
  };
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

  const bookAnchors = seedBookNodeLayout(simNodes, centerVid);
  seedChapterByBookLayout(simNodes, centerVid);
  seedVerseByChapterLayout(simNodes, maxVerseDegree(simNodes));

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
        .strength((link) => {
          // Cross-ref and membership links are visual only; hierarchy forces place nodes.
          if (
            link.kind === 'book' ||
            link.kind === 'chapter' ||
            link.kind === 'primary' ||
            link.kind === 'mesh'
          ) {
            return 0;
          }
          return membershipLinkStrength(link);
        })
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
        .distanceMax(640)
        .theta(0.82),
    )
    .force('book-anchor', forceBookAnchor(simNodes, bookAnchors, centerVid))
    .force('book-repel', forceBookRepel(simNodes))
    .force('node-repel', forceNodeRepel(simNodes))
    .force('verse-arc', forceVerseArcAnchor(simNodes))
    .force('chapter-ring', forceChapterRingAnchor(simNodes, centerVid))
    .force(
      'collide',
      forceCollide<SimNode>()
        .radius((node) => (node.kind === 'verse' ? 0 : hubCollideRadius(node)))
        .strength(1)
        .iterations(4),
    )
    .stop();

  const ticks = Math.min(580, 200 + simNodes.length * 4);
  for (let i = 0; i < ticks; i += 1) simulation.tick();

  // Cross-ref forces must not win over hierarchy: size-aware verse placement on chapter arcs.
  layoutVersesNearChapters(simNodes);

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