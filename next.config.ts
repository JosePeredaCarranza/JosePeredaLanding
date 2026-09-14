import type {NextConfig} from 'next';
const config: NextConfig = {turbopack:{root:process.cwd()},outputFileTracingRoot:process.cwd(),images: {formats: ['image/webp'], remotePatterns: [{protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/images/**'}]}, poweredByHeader: false};
export default config;
