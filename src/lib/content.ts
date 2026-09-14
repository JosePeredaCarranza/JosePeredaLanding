import 'server-only';
import {cache} from 'react';
import {createClient} from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import defaults from '@/content/defaults.json';
export type Photo = {local?: string; alt?: string; asset?: {_ref: string}; crop?: {top:number;bottom:number;left:number;right:number}; hotspot?: {x:number;y:number;width:number;height:number}};
export type Project = {_key:string;title:string;category:string;description?:string;image?:Photo|null;url?:string;testimonial?:string;author?:string;rating?:number};
export type Content = Omit<typeof defaults, 'projects'|'socials'|'logo'> & {logo:Photo;projects:Project[];socials:{_key:string;platform:'instagram'|'facebook'|'linkedin'|'whatsapp'|'github'|'tiktok';url:string}[]};
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
export const client = projectId ? createClient({projectId,dataset:process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',apiVersion:'2026-09-01',useCdn:false,perspective:'published'}) : null;
export const getContent = cache(async ():Promise<Content> => {
 if (!client) return defaults as Content;
 const data = await client.fetch<Content | null>(`*[_type == "landingPage" && _id == "landingPage"][0]{brand,logo,nav,contactLabel,hero,about,processTitle,steps,servicesTitle,serviceCta,services,projectsTitle,projectCta,projects,contact,footer,socials,privacy,seo,appearance,sections}`,{}, {next:{revalidate:60}});
 if (!data) return defaults as Content;
 return {...defaults,...data} as Content;
});
export function photoUrl(photo:Photo, width=1200) {
 if(photo.asset && client) return imageUrlBuilder(client).image(photo).width(width).fit('max').format('webp').quality(85).url();
 return photo.local || '';
}
export function safeUrl(url?:string){return url && /^(https:\/\/|mailto:|tel:|#[a-z])/i.test(url) ? url : undefined;}
