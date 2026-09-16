import type {NextConfig} from 'next';
const pages=process.env.NEXT_PUBLIC_STATIC_EXPORT==='true';
const config:NextConfig={
 turbopack:{root:process.cwd()},outputFileTracingRoot:process.cwd(),
 ...(pages?{output:'export' as const,trailingSlash:true}:{}),
 basePath:process.env.NEXT_PUBLIC_BASE_PATH||'',
 images:{unoptimized:pages,formats:['image/webp'],remotePatterns:[{protocol:'https',hostname:'cdn.sanity.io',pathname:'/images/**'}]},
 poweredByHeader:false,
};
export default config;
