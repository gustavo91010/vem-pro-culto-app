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
    const vpcUrl = process.env.VPC_API_URL || 'http://3.229.225.73:8084';
    const authUrl = process.env.AUTH_API_URL || 'http://3.229.225.73:8082';
    
    console.log(`Using VPC_API_URL: ${vpcUrl}`);
    console.log(`Using AUTH_API_URL: ${authUrl}`);

    return [
      {
        source: '/api/vpc/:path*',
        destination: `${vpcUrl}/:path*`,
      },
      {
        source: '/api/auth/:path*',
        destination: `${authUrl}/:path*`,
      },
    ]
  },
};

export default nextConfig;
