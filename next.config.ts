import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/account", destination: "/settings/account", permanent: false },
      { source: "/settings", destination: "/settings/workspace", permanent: false },
      { source: "/owner-dashboard", destination: "/owner", permanent: false },
      { source: "/cleaner-dashboard", destination: "/field/cleaning", permanent: false },
      { source: "/maintenance-dashboard", destination: "/field/maintenance", permanent: false },
    ];
  },
  typedRoutes: false,
};

export default nextConfig;
