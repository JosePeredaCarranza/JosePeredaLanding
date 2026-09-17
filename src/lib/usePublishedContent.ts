"use client";
import {useEffect,useState} from 'react';
import {client,CONTENT_QUERY,mergeContent,type Content} from './public-content';

export function usePublishedContent(initial:Content){
 const [content,setContent]=useState(initial);
 useEffect(()=>{
  if(!client)return;
  const publicClient=client;
  let disposed=false,pending=false,again=false,timer:ReturnType<typeof setTimeout>|undefined;
  let controller:AbortController|undefined;
  async function refresh(){
   if(disposed||document.hidden)return;
   if(pending){again=true;return;}
   pending=true;controller=new AbortController();
   try{
    const data=await publicClient.fetch<Content|null>(CONTENT_QUERY,{}, {cache:'no-store',signal:controller.signal});
    if(!disposed&&data)setContent(mergeContent(data));
   }catch{ /* Retain the last published content during temporary network failures. */ }
   finally{pending=false;if(again&&!disposed){again=false;void refresh();}}
  }
  function schedule(){clearTimeout(timer);timer=setTimeout(()=>void refresh(),200);}
  const subscription=publicClient.listen('*[_type == "landingPage" && _id == "landingPage"]',{}, {includeResult:false,visibility:'query',events:['mutation','welcome','reconnect']}).subscribe({next:schedule,error:schedule});
  void refresh();
  // Recover missed events and disconnected streams without requiring a page reload.
  const poll=setInterval(()=>void refresh(),30000);
  window.addEventListener('focus',schedule);window.addEventListener('online',schedule);document.addEventListener('visibilitychange',schedule);
  return()=>{disposed=true;controller?.abort();clearTimeout(timer);clearInterval(poll);subscription.unsubscribe();window.removeEventListener('focus',schedule);window.removeEventListener('online',schedule);document.removeEventListener('visibilitychange',schedule);};
 },[]);
 useEffect(()=>{
  document.title=content.seo.title;
  const values:Record<string,string>={'description':content.seo.description,'og:title':content.seo.title,'og:description':content.seo.description,'twitter:title':content.seo.title,'twitter:description':content.seo.description};
  document.querySelectorAll<HTMLMetaElement>('meta[name],meta[property]').forEach(meta=>{const key=meta.name||meta.getAttribute('property')||'';if(values[key])meta.content=values[key];});
 },[content.seo.title,content.seo.description]);
 return content;
}
