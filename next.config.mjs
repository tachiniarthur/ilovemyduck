/** @type {import('next').NextConfig} */

// FFmpeg.wasm relies on SharedArrayBuffer, which the browser only enables when
// the page is "cross-origin isolated". That requires these two headers on EVERY
// route; without them ffmpeg.load() fails silently and the app appears broken.
// This is the single most common cause of failure for in-browser FFmpeg apps.
const crossOriginIsolationHeaders = [
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Embedder-Policy",
    value: "require-corp",
  },
];

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Apply the isolation headers to all routes.
        source: "/:path*",
        headers: crossOriginIsolationHeaders,
      },
    ];
  },
};

export default nextConfig;
