import Link from 'next/link';import {getContent} from '@/lib/content';
export default async function Privacy(){const c=await getContent();return <main className="legal wrap"><Link href="/">← {c.brand}</Link><h1>{c.privacy.title}</h1><p>{c.privacy.text}</p><a href={`mailto:${c.footer.email}`}>{c.footer.email}</a></main>;}
