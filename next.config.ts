import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  serverExternalPackages: ['mongoose', 'bcryptjs', 'jsonwebtoken'],
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // ADD THIS LINE - empty turbopack config
  turbopack: {},
  
  // Keep your webpack config
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        dns: false,
      };
    }
    return config;
  },
};

export default nextConfig;