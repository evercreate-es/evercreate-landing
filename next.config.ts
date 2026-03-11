import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' app.cal.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src * data: blob:",
              "connect-src 'self' *.supabase.co app.cal.com",
              "frame-src 'self' app.cal.com",
              "object-src 'none'",
              "base-uri 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
