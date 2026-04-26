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
        // Corrigido para /api-vpc que está no seu .env
        source: '/api-vpc/:path*',
        destination: `${vpcUrl}/:path*`,
      },
      {
        // Corrigido para /api-auth que está no seu .env 
        // Adicionado o /auth no destino para bater com o Controller
        source: '/api-auth/:path*',
        destination: `${authUrl}/auth/:path*`,
      },
    ]
  },
};

export default nextConfig;
