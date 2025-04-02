/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false, // Temporarily disabled for debugging hook rule violation
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'uwaqfsbzxfqunjfneqbe.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/pet-images/**', // Allow images specifically from the pet-images bucket
            },
        ],
    },
};

export default nextConfig; 