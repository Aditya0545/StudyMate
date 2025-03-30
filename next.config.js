/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'drive.google.com',
      'docs.google.com',
      'img.youtube.com',
      'i.ytimg.com',
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Enable trailing slashes for Netlify
  trailingSlash: true,
  // Add headers
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 