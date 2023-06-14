/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@fern-api/ui", "react-syntax-highlighter"],
    productionBrowserSourceMaps: true,
};

module.exports = nextConfig;
