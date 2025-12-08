/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  reactCompiler: true,
  productionBrowserSourceMaps: false,
};

export default nextConfig;
