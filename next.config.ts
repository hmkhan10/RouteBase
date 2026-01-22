/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    mcp: {
      enabled: true,
      port: 3000, // Matches your localhost port
    },
  },
};

export default nextConfig;