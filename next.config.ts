import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'assets.coingecko.com',
      'safe-transaction-assets.safe.global',
      'assets.smold.app',
    ],
  },
}

export default nextConfig
