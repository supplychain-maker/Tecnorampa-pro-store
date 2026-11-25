import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['pdfkit'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/products/:file(.*\\.(?:jpg|jpeg|png|webp|gif|svg))',
        destination: '/images/products/:file',
      },
    ];
  },
};

export default nextConfig;
