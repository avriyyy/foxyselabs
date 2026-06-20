/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // No `output` — we run `next start` in the runner stage. Standalone output
  // is unreliable with pnpm monorepo layouts because outputFileTracing
  // struggles with the non-standard node_modules tree.
  experimental: {
    typedRoutes: false,
  },
  async rewrites() {
    const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";
    return [
      { source: "/api/proxy/:path*", destination: `${gateway}/api/:path*` },
    ];
  },
};

export default nextConfig;
