import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* This line is the key for the free tier */
  output: 'export', 
  
  images: {
    /* Required for static export on Firebase Hosting */
    unoptimized: true, 
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;