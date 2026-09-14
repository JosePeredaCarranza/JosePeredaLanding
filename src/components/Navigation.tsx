"use client";
import {useEffect,useRef,type ReactNode} from 'react';

function Border(){return <svg className="nav-progress" aria-hidden="true"><rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="22" pathLength="100"/></svg>;}
export function Navigation({logo,brand,links,contactLabel}:{logo:ReactNode;brand:string;links:{_key:string;label:string;href?:string}[];contactLabel:string}){
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const element=root.current;if(!element)return;
  const items=Array.from(element.querySelectorAll<HTMLElement>('[data-nav-item]'));
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0;
  function update(){frame=0;const scroll=Math.max(0,window.scrollY);element!.style.setProperty('--nav-progress',String(Math.min(1,scroll/140)));items.forEach((item,index)=>item.style.setProperty('--lift',String(reduced.matches?(scroll>20?1:0):Math.max(0,Math.min(1,(scroll-index*14)/64)))));}
  function schedule(){if(!frame)frame=window.requestAnimationFrame(update);}
  update();window.addEventListener('scroll',schedule,{passive:true});reduced.addEventListener('change',schedule);
  return ()=>{window.removeEventListener('scroll',schedule);reduced.removeEventListener('change',schedule);window.cancelAnimationFrame(frame);};
 },[]);
 return <div className="navigation-space" id="inicio"><div className="navigation-fixed" ref={root}><header className="header wrap">
  <a className="brand nav-item" data-nav-item href="#inicio" aria-label={brand}>{logo}</a>
  <nav aria-label="Navegación principal">{links.map(link=><a className="nav-item nav-section" data-nav-item key={link._key} href={link.href}><span>{link.label}</span><Border/></a>)}</nav>
  <a className="button small nav-item nav-contact" data-nav-item href="#contacto">{contactLabel}<span aria-hidden="true">↗</span><Border/></a>
 </header></div></div>;
}
