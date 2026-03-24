/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/vpc/:path*',
        destination: 'http://20.246.66.131:8084/:path*',
      },
      {
        source: '/api/auth/:path*',
        destination: 'http://20.246.66.131:8082/:path*',
      },
    ]
  },
};

export default nextConfig;
