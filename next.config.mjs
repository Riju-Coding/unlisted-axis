/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1) Enable static HTML export…
  

  // 2) Serve everything under /admin
  basePath: '/admin',

  // the rest of your existing settings
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
