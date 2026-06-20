/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
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
