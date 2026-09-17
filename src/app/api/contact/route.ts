import {NextResponse} from 'next/server';
import {createClient} from '@sanity/client';
import {z} from 'zod';
import {getContent} from '@/lib/content';
export const runtime='nodejs';
const schema=z.object({name:z.string().trim().min(2).max(120),phone:z.union([z.literal(''),z.string().regex(/^[+0-9() .-]{7,25}$/)]).optional(),email:z.email().max(200),service:z.string().max(120),stage:z.string().min(1).max(120),message:z.string().trim().min(10).max(5000),privacy:z.literal('on'),website:z.string().max(0).optional()});
export async function POST(request:Request){
 const origin=request.headers.get('origin');if(!origin || origin!==new URL(request.url).origin)return NextResponse.json({error:'Origen no permitido'},{status:403});
 const text=await request.text();if(text.length>15000)return NextResponse.json({error:'Solicitud demasiado extensa'},{status:413});
 let input;try{input=schema.safeParse(JSON.parse(text));}catch{return NextResponse.json({error:'JSON inválido'},{status:400});}
 if(!input.success)return NextResponse.json({error:'Revisa los campos del formulario'},{status:400});
 const c=await getContent();if(!c.contact.projectTypes.includes(input.data.service)||!c.contact.stages.includes(input.data.stage))return NextResponse.json({error:'Opción inválida'},{status:400});
 const projectId=process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,token=process.env.SANITY_API_WRITE_TOKEN;
 const inquiryDataset=process.env.SANITY_INQUIRY_DATASET;
 if(!projectId||!token||!inquiryDataset||inquiryDataset===(process.env.NEXT_PUBLIC_SANITY_DATASET||'production'))return NextResponse.json({error:'Contacto todavía no configurado'},{status:503});
 const {website,privacy,...fields}=input.data;void website;void privacy;
 try{const client=createClient({projectId,dataset:inquiryDataset,token,apiVersion:'2026-09-01',useCdn:false});await client.create({_type:'inquiry',...fields,privacy:true,privacyText:c.privacy.text,createdAt:new Date().toISOString(),status:'new'});return NextResponse.json({ok:true});}catch{console.error('No se pudo guardar la solicitud de contacto');return NextResponse.json({error:'Servicio temporalmente no disponible'},{status:502});}
}
