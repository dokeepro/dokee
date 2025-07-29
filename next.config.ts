const nextConfig = {
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