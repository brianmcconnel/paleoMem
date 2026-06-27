import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/paleoMem',
  assetPrefix: '/paleoMem/',
  transpilePackages: ['@deck.gl/react', '@deck.gl/core', '@deck.gl/layers'],
  images: {
    unoptimized: true,
  },
  // trailingSlash: true, // optional, can help with routing on GH Pages
};

export default nextConfig;
