/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable the Next.js developer indicator
  devIndicators: {
    position: 'bottom-right',
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  },
};

module.exports = nextConfig;