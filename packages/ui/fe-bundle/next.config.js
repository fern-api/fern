/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@fern-api/ui"],
    productionBrowserSourceMaps: true,
};

module.exports = nextConfig;
