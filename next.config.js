/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    experimental: {
        serverActions: true,
    },
    // Set the correct runtime for Vercel deployment
    serverRuntimeConfig: {
        PROJECT_ROOT: __dirname,
    },
    // Enable middleware
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'x-middleware-cache',
                        value: 'no-cache',
                    },
                ],
            },
        ];
    },
}

module.exports = nextConfig 