/** Guardrails for BFS expansion and d3-force layout; deck.gl can render well beyond these. */
export const VAV_GRAPH_LIMITS = {
  maxNodes: 400,
  maxPrimaryEdges: 800,
  maxMeshLinks: 280,
  meshMaxNeighbors: 120,
  maxLinkLayers: 6,
  layer2EdgesPerNode: 30,
  maxFrontierPerLayer: 64,
} as const;

export type VavGraphStats = {
  nodeCount: number;
  edgeCount: number;
  truncated: boolean;
  message: string | null;
};