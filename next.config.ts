const nextConfig = {
    transpilePackages: ['@vercel/blob'],
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