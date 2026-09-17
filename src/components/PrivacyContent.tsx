"use client";
import Link from 'next/link';
import {type Content} from '@/lib/public-content';
import {usePublishedContent} from '@/lib/usePublishedContent';
export function PrivacyContent({initial}:{initial:Content}){const c=usePublishedContent(initial);return <main className="legal wrap"><Link href="/">← {c.brand}</Link><h1>{c.privacy.title}</h1><p>{c.privacy.text}</p><a href={`mailto:${c.footer.email}`}>{c.footer.email}</a></main>;}
