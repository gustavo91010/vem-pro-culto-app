/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/vpc/:path*',
        destination: `${process.env.VPC_API_URL || 'http://localhost:8084'}/:path*`,
      },
      {
        source: '/api/auth/:path*',
        destination: `${process.env.AUTH_API_URL || 'http://20.246.66.131:8082'}/:path*`,
      },
    ]
  },
};

export default nextConfig;
