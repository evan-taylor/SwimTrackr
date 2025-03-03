/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },
    // Set the correct runtime for Vercel deployment
    serverRuntimeConfig: {
        PROJECT_ROOT: __dirname,
    },
}

module.exports = nextConfig 