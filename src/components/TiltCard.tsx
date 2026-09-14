"use client";
import {useEffect,useRef,type CSSProperties,type ReactNode,type PointerEvent} from 'react';

export function TiltCard({children,index}:{children:ReactNode;index:number}){
 const slot=useRef<HTMLDivElement>(null),card=useRef<HTMLElement>(null);
 const target=useRef({x:0,y:0}),angle=useRef({x:0,y:0}),frame=useRef(0),lastTime=useRef(0);
 function illuminate(x:number,y:number){
  const surface=card.current,anchor=slot.current;if(!surface||!anchor)return;
  const panel=anchor.closest('.about')!.getBoundingClientRect(),bounds=anchor.getBoundingClientRect();
  // One stationary light at the parent panel's upper-left glow, in CSS screen coordinates.
  const light=[panel.left+panel.width*.05-(bounds.left+bounds.width/2),panel.top-(bounds.top+bounds.height/2),460];
  const length=Math.hypot(...light);const [lx,ly,lz]=light.map(v=>v/length);
  const a=x*Math.PI/180,b=y*Math.PI/180;
  // CSS rotateX(a) rotateY(b): transformed outward-facing surface normal.
  const nx=Math.sin(b),ny=-Math.sin(a)*Math.cos(b),nz=Math.cos(a)*Math.cos(b);
  const diffuse=Math.max(0,nx*lx+ny*ly+nz*lz);
  const halfLength=Math.hypot(lx,ly,lz+1),hx=lx/halfLength,hy=ly/halfLength,hz=(lz+1)/halfLength;
  const specular=Math.pow(Math.max(0,nx*hx+ny*hy+nz*hz),24);
  // Half-vector in the tilted surface's local coordinates locates the reflected highlight.
  const localX=Math.cos(b)*hx+Math.sin(a)*Math.sin(b)*hy-Math.cos(a)*Math.sin(b)*hz;
  const localY=Math.cos(a)*hy+Math.sin(a)*hz;
  surface.style.setProperty('--tilt-x',`${x}deg`);surface.style.setProperty('--tilt-y',`${y}deg`);
  surface.style.setProperty('--illumination',String(.66+diffuse*.62));
  surface.style.setProperty('--reflection',String(.06+specular*.84));
  surface.style.setProperty('--reflection-x',`${50+localX*110}%`);
  surface.style.setProperty('--reflection-y',`${50+localY*110}%`);
  surface.style.setProperty('--edge-light',String(.06+diffuse*.25+specular*.3));
 }
 function tick(time:number){
  const dt=lastTime.current?Math.min(50,time-lastTime.current):16;lastTime.current=time;
  const blend=1-Math.exp(-dt/65),current=angle.current,wanted=target.current;
  current.x+=(wanted.x-current.x)*blend;current.y+=(wanted.y-current.y)*blend;
  const settled=Math.abs(wanted.x-current.x)+Math.abs(wanted.y-current.y)<.015;
  if(settled){current.x=wanted.x;current.y=wanted.y;}
  illuminate(current.x,current.y);
  frame.current=settled?0:requestAnimationFrame(tick);if(settled)lastTime.current=0;
 }
 function animate(){if(!frame.current)frame.current=requestAnimationFrame(tick);}
 function reset(){target.current={x:0,y:0};animate();}
 function move(event:PointerEvent<HTMLDivElement>){
  if(event.pointerType!=='mouse'||!matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches)return;
  const rect=event.currentTarget.getBoundingClientRect();
  const x=Math.max(-1,Math.min(1,(event.clientX-rect.left)/rect.width*2-1));
  const y=Math.max(-1,Math.min(1,(event.clientY-rect.top)/rect.height*2-1));
  target.current={x:-y*7,y:x*7};animate();
 }
 useEffect(()=>{
  const element=slot.current;if(!element)return;
  const refresh=()=>illuminate(angle.current.x,angle.current.y);
  const observer=new ResizeObserver(refresh);observer.observe(element);refresh();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function preference(){if(reduced.matches){cancelAnimationFrame(frame.current);frame.current=0;target.current=angle.current={x:0,y:0};illuminate(0,0);}}
  reduced.addEventListener('change',preference);
  return()=>{observer.disconnect();reduced.removeEventListener('change',preference);cancelAnimationFrame(frame.current);};
 },[]);
 return <div ref={slot} className="stat-slot" style={{'--step':index} as CSSProperties} onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset}><article ref={card}>{children}</article></div>;
}
