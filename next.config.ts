import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/paleoMem',
  assetPrefix: '/paleoMem/',
  images: {
    unoptimized: true,
  },
  // trailingSlash: true, // optional, can help with routing on GH Pages
};

export default nextConfig;
