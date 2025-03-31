/** @type {import('next').NextConfig} */
const nextConfig = {
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