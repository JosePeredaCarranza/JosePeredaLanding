import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure';
import {schemaTypes,inquiry} from './sanity/schema';
const projectId=process.env.SANITY_STUDIO_PROJECT_ID||'16asym1c';
export default defineConfig([
{name:'contenido',basePath:'/contenido',title:'José Pereda · Web',projectId,dataset:process.env.SANITY_STUDIO_DATASET||'production',plugins:[structureTool({structure:S=>S.list().title('Contenido').items([S.listItem().title('Contenido de la landing').child(S.document().schemaType('landingPage').documentId('landingPage'))])})],schema:{types:schemaTypes.filter(t=>t.name!=='inquiry'),templates:templates=>templates.filter(t=>t.schemaType!=='landingPage')},document:{actions:(actions,context)=>context.schemaType==='landingPage'?actions.filter(a=>!['delete','duplicate','unpublish'].includes(a.action||'')):actions}},
{name:'solicitudes',basePath:'/solicitudes',title:'José Pereda · Solicitudes privadas',projectId,dataset:process.env.SANITY_STUDIO_INQUIRY_DATASET||'inquiries',plugins:[structureTool()],schema:{types:[inquiry],templates:[]}}
]);
