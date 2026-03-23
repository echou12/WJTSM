// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co' }],
  },
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
}

export default nextConfig
