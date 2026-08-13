const nextConfig = {
    transpilePackages: ['@vercel/blob'],
    // Keep native Node backend libs out of the bundle so mongoose/aws-sdk/nodemailer
    // load as real CommonJS modules inside the Node.js route handlers.
    serverExternalPackages: ['mongoose', 'aws-sdk', 'nodemailer'],
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