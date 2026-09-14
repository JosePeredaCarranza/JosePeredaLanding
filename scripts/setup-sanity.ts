import {getCliClient} from 'sanity/cli';
import {readFile} from 'node:fs/promises';
const client=getCliClient({apiVersion:'2026-09-01'});
if(client.config().projectId!=='16asym1c')throw new Error('Proyecto incorrecto');
async function main(){
 const datasets=await client.datasets.list();
 const privateDataset=datasets.find(d=>d.name==='inquiries');
 if(!privateDataset)await client.datasets.create('inquiries',{aclMode:'private'});
 else if(privateDataset.aclMode!=='private')throw new Error('El dataset de solicitudes debe ser privado');
 if(await client.getDocument('landingPage')){console.log('Landing existente: contenido conservado.');return;}
 const content=JSON.parse(await readFile('src/content/defaults.json','utf8'));
 async function upload(photo:{local:string;alt:string}){const asset=await client.assets.upload('image',await readFile('public'+photo.local),{filename:photo.local.split('/').pop(),contentType:'image/webp'});return {_type:'photo',asset:{_type:'reference',_ref:asset._id},alt:photo.alt};}
 content.logo=await upload(content.logo);content.hero.image=await upload(content.hero.image);
 for (const stat of content.about.stats) { if(stat.image?.local) stat.image=await upload(stat.image); }
 await client.createIfNotExists(content);
 console.log('Landing importada en production. Dataset inquiries privado verificado.');
}
main().catch(()=>{console.error('No se pudo completar la importación. Revisa permisos del proyecto.');process.exitCode=1;});
