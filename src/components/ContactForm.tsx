"use client";
import {useState} from 'react';
import {sitePath,staticExport} from '@/lib/paths';
import type {Content} from '@/lib/content';
export function ContactForm({content:c,services,email}:{email:string;content:Content['contact'];services:Content['services']}){
 const [status,setStatus]=useState<'idle'|'pending'|'success'|'error'|'mail'>('idle');
 async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault(); const form=event.currentTarget;setStatus('pending');try{const data=Object.fromEntries(new FormData(form));if(staticExport){
 const body=[`Nombre: ${data.name}`,`WhatsApp: ${data.phone}`,`Correo: ${data.email}`,`Servicio: ${data.service}`,`Plazo: ${data.timeline}`,`Mensaje: ${data.message}`,`Acepta comunicaciones: ${data.marketing==='on'?'Sí':'No'}`].join('\n');
 window.location.href=`mailto:${email}?subject=${encodeURIComponent('Consulta de proyecto web')}&body=${encodeURIComponent(body)}`;
 setStatus('mail');return;
 }const response=await fetch(sitePath('/api/contact'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});if(!response.ok)throw new Error();setStatus('success');form.reset();}catch{setStatus('error');}}
 return <form onSubmit={submit} className="contact-form">
 <label>{c.nameLabel}<input name="name" autoComplete="name" required maxLength={120}/></label>
 <div className="field-pair"><label>{c.phoneLabel}<input name="phone" type="tel" autoComplete="tel" required pattern={"[+0-9\\(\\) .\\-]{7,25}"} maxLength={25}/></label><label>{c.emailLabel}<input name="email" type="email" autoComplete="email" required maxLength={200}/></label></div>
 <label>{c.serviceLabel}<select name="service" required defaultValue=""><option value="" disabled>{c.serviceLabel}</option>{services.map(s=><option key={s._key}>{s.title}</option>)}</select></label>
 <label>{c.timelineLabel}<select name="timeline" required defaultValue=""><option value="" disabled>{c.timelineLabel}</option>{c.timelines.map(t=><option key={t}>{t}</option>)}</select></label>
 <label>{c.messageLabel}<textarea name="message" rows={5} required minLength={10} maxLength={5000}/></label>
 <div className="honey" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
 <label className="check"><input type="checkbox" name="privacy" required/><span>{c.privacyLabel} <a href={sitePath("/privacidad/")} target="_blank" rel="noopener">↗</a></span></label>
 <label className="check"><input type="checkbox" name="marketing"/><span>{c.marketingLabel}</span></label>
 {staticExport&&<p className="form-status">Se abrirá tu aplicación de correo con los datos de tu consulta. También puedes escribir a <a href={`mailto:${email}`}>{email}</a>.</p>}
 <button className="button primary" disabled={status==='pending'}>{status==='pending'?c.pendingLabel:staticExport?'Preparar correo':c.submitLabel}<span aria-hidden="true">↗</span></button>
 <p role="status" aria-live="polite" className={`form-status ${status}`}>{status==='mail'?'Se abrirá tu aplicación de correo. Revisa el mensaje y envíalo para completar la consulta.':status==='success'?c.successMessage:status==='error'?c.errorMessage:''}</p>
 </form>;
}
