import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    transpilePackages: [
        "@packages/ui",
        "@packages/domain",
        "@packages/services",
        "@packages/types",
    ],
};

export default nextConfig;
