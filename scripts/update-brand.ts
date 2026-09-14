import {getCliClient} from 'sanity/cli';
import {readFile} from 'node:fs/promises';
const client=getCliClient({apiVersion:'2026-09-01'});
async function main(){
 const page=await client.getDocument('landingPage');if(!page)throw new Error('Landing no encontrada');
 async function image(name:string,alt:string){const asset=await client.assets.upload('image',await readFile(`public/images/${name}.webp`),{filename:`${name}.webp`,contentType:'image/webp'});return {_type:'photo',asset:{_type:'reference',_ref:asset._id},alt};}
 const logo=await image('logo','José Pereda — JP');
 const replacements:Record<string,unknown>={logo};
 for(const [key,name] of [['internet','mapa-peru'],['compra','personas'],['confianza','tienda']]){
 if(page.about?.stats?.some((s:{_key:string})=>s._key===key))replacements[`about.stats[_key=="${key}"].image`]=await image(name,{'mapa-peru':'Mapa del Perú',personas:'Grupo de personas',tienda:'Tienda'}[name]||'');
 }
 await client.patch('landingPage').ifRevisionId(page._rev).set(replacements).commit();
 const draft=await client.getDocument('drafts.landingPage');if(draft)await client.patch(draft._id).ifRevisionId(draft._rev).set(replacements).commit();
 console.log('Logo e iconos del ZIP actualizados en Sanity.');
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
