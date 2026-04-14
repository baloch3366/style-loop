import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  serverExternalPackages: ['mongoose', 'bcryptjs', 'jsonwebtoken'],
  compiler: { removeConsole: process.env.NODE_ENV === 'production' },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'next/document': false,  // prevents any import of 'next/document' on the client
      };
    }
    return config;
  },

    
};

export default nextConfig;