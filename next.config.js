/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy API requests to Python backend during local development
  async rewrites() {
    // Only proxy in development - in production, Vercel handles this
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          // Proxy /backend/* to Python backend
          // /api/auth/* is handled by Next.js (NextAuth)
          source: '/backend/:path*',
          destination: 'http://localhost:8000/backend/:path*',
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;
