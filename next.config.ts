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
};

export default nextConfig;
