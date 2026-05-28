const nextConfig = {
    transpilePackages: ['@vercel/blob'],
    experimental: {
        serverActions: {
            bodySizeLimit: '50mb',
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "cdn.allship.ai",
                port: "",
                pathname: "/**",
            },
        ],
    },
};

export default nextConfig;