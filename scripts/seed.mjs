import {createClient} from '@sanity/client';
import {readFile} from 'node:fs/promises';
const projectId=process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const token=process.env.SANITY_API_WRITE_TOKEN;
if(!projectId||!token)throw new Error('Configura NEXT_PUBLIC_SANITY_PROJECT_ID y SANITY_API_WRITE_TOKEN en .env.local');
const client=createClient({projectId,dataset:process.env.NEXT_PUBLIC_SANITY_DATASET||'production',token,apiVersion:'2026-09-01',useCdn:false});
if(await client.getDocument('landingPage')){console.log('La landing ya existe. No se sobrescribe contenido.');process.exit(0);}
const content=JSON.parse(await readFile(new URL('../src/content/defaults.json',import.meta.url),'utf8'));
async function upload(photo){const asset=await client.assets.upload('image',await readFile(new URL('../public'+photo.local,import.meta.url)),{filename:photo.local.split('/').pop(),contentType:'image/webp'});return {_type:'photo',asset:{_type:'reference',_ref:asset._id},alt:photo.alt};}
content.hero.image=await upload(content.hero.image);content.logo=await upload(content.logo);
for (const stat of content.about.stats) { if(stat.image?.local) stat.image=await upload(stat.image); }
await client.createIfNotExists(content);console.log('Contenido inicial importado. Edita y publica desde Sanity Studio.');
