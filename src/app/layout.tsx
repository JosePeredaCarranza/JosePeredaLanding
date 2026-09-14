import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import './globals.css';
import {getContent} from '@/lib/content';
export async function generateMetadata(){const c=await getContent();return {title:c.seo.title,description:c.seo.description,metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000'),openGraph:{title:c.seo.title,description:c.seo.description,locale:'es_PE',type:'website'}};}
export default function Layout({children}:{children:React.ReactNode}){return <html lang="es"><body>{children}</body></html>;}
