/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
    serverActions: { bodySizeLimit: '4mb' },
  },
};

module.exports = nextConfig;
