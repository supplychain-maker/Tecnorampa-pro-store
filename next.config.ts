import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
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
  async redirects() {
    return [
      {
        source: '/products/:file(.*\\.(?:jpg|jpeg|png|webp|gif|svg))',
        destination: '/images/products/:file',
        permanent: true,
      },
    ];
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
