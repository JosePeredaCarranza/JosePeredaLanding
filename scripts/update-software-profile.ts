import {getCliClient} from 'sanity/cli';
import {readFile} from 'node:fs/promises';
const client=getCliClient({apiVersion:'2026-09-01'});
async function main(){
 if(client.config().projectId!=='16asym1c')throw new Error('Proyecto incorrecto');
 const next=JSON.parse(await readFile('src/content/defaults.json','utf8'));
 for(const id of ['landingPage','drafts.landingPage']){
  const current=await client.getDocument(id);if(!current)continue;
  const fields:Record<string,unknown>={
   'about.title':next.about.title,
   'about.stats':next.about.stats.map((item:Record<string,unknown>,i:number)=>({...item,_key:current.about?.stats?.[i]?._key||item._key})),
   steps:next.steps.map((item:Record<string,unknown>,i:number)=>({...item,_key:current.steps?.[i]?._key||item._key})),
   services:next.services.map((item:Record<string,unknown>,i:number)=>({...item,_key:current.services?.[i]?._key||item._key})),
   serviceCta:next.serviceCta,'hero.primary':next.hero.primary,'hero.eyebrow':next.hero.eyebrow,
   'seo.title':next.seo.title,'seo.description':next.seo.description,'footer.copyright':next.footer.copyright,
  };
  for(const key of ['title','description','phoneLabel','serviceLabel','projectTypes','stageLabel','stages','submitLabel','mailHint','mailStatus'])fields[`contact.${key}`]=next.contact[key];
  await client.patch(id).ifRevisionId(current._rev).set(fields).commit();
 }
 console.log('Contenido actualizado conservando identidad, contacto, proyectos e imágenes personales.');
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
