/** @type {import('next').NextConfig} */
const nextConfig = {
  // needed for NextJS 14
  // by default anything that's dynamic is cached for 30 seconds
  experimental: {
    staleTimes: {
      dynamic: 0
    }
  }
};

export default nextConfig;
