import type { NextConfig } from "next";

const isWindows = process.platform === "win32";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  typescript: {
    // Workaround for Windows-only build failures (EPERM on child process spawn).
    // Keep type-checking on CI/Vercel (Linux) as usual.
    ignoreBuildErrors: isWindows,
  },
  experimental: {
    // Avoid using child_process workers on Windows where spawn may be blocked.
    workerThreads: isWindows,
  },
};

export default nextConfig;
