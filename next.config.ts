import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  rewrites: async () => {
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/py/:path*",
          destination: "http://127.0.0.1:8000/api/py/:path*",
        },
        {
          source: "/docs",
          destination: "http://127.0.0.1:8000/api/py/docs",
        },
        {
          source: "/openapi.json",
          destination: "http://127.0.0.1:8000/api/py/openapi.json",
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
