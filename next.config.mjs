/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // app/manifest.ts is served at /manifest.webmanifest.
      // Also answer the well-known /manifest.json URL.
      { source: "/manifest.json", destination: "/manifest.webmanifest" },
    ];
  },
};

export default nextConfig;
