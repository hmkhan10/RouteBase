const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*/',
                // Use an environment variable for the backend URL
                destination: `${process.env.BACKEND_URL}/api/:path*/`,
            },
        ];
    },
};