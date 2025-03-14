/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Disable server-side features since we're exporting to static HTML
  trailingSlash: true,
};

module.exports = nextConfig;
