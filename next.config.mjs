/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "uploads.scratch.mit.edu" }],
  },
  async redirects() {
    return [{ source: "/blog/:path*", destination: "/khoa-hoc", permanent: true }];
  },
};

export default nextConfig;
