/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // <--- REQUIRED FOR DOCKER
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatar.iran.liara.run' },
      { protocol: 'http', hostname: 'localhost' }
    ]
  }
};

export default nextConfig;