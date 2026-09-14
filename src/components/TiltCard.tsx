"use client";

import {useRef, type CSSProperties, type ReactNode, type PointerEvent} from 'react';

export function TiltCard({children,index}:{children:ReactNode;index:number}) {
  const card=useRef<HTMLElement>(null);
  function reset(){
    card.current?.style.setProperty('--tilt-x','0deg');
    card.current?.style.setProperty('--tilt-y','0deg');
  }
  function move(event:PointerEvent<HTMLDivElement>){
    if(event.pointerType!=='mouse'||!window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches){reset();return;}
    const rect=event.currentTarget.getBoundingClientRect();
    const x=Math.max(-1,Math.min(1,(event.clientX-rect.left)/rect.width*2-1));
    const y=Math.max(-1,Math.min(1,(event.clientY-rect.top)/rect.height*2-1));
    card.current?.style.setProperty('--tilt-x',`${-y*5}deg`);
    card.current?.style.setProperty('--tilt-y',`${x*5}deg`);
  }
  return <div className="stat-slot" style={{'--step':index} as CSSProperties} onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset}>
    <article ref={card}>{children}</article>
  </div>;
}
