"use client";
import {useEffect,useRef,useState} from 'react';
import {FiMessageCircle,FiGitBranch,FiCode,FiCheckCircle,FiSend} from 'react-icons/fi';
const stepIcons=[FiMessageCircle,FiGitBranch,FiCode,FiCheckCircle,FiSend];
type Step={_key:string;title:string;text:string};
type Connector={key:string;path:string;start:[number,number];end:[number,number]};
export function WorkProcess({title,steps}:{title:string;steps:Step[]}){
 const track=useRef<HTMLDivElement>(null);
 const [lines,setLines]=useState<Connector[]>([]);
 const marker=useRef<SVGGElement>(null);
 useEffect(()=>{
  const root=track.current;if(!root||!lines.length)return;
  const paths=Array.from(root.querySelectorAll<SVGPathElement>('.connector-path'));
  const items=Array.from(root.querySelectorAll('li'));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const durations=paths.map(path=>Math.min(2100,Math.max(750,path.getTotalLength()/260*1000)));
  const dwell=950,total=durations.reduce((a,b)=>a+b,0)+items.length*dwell+650;
  let frame=0,previous=0,elapsed=0,visible=false;
  function hide(){if(marker.current)marker.current.style.opacity='0';items.forEach(item=>item.classList.remove('is-current-step'));}
  function tick(time:number){
   elapsed+=previous?Math.min(time-previous,64):0;previous=time;
   let progress=elapsed%total,stage=0,travel=false;
   for(;stage<items.length;stage++){
    if(progress<dwell)break;
    progress-=dwell;
    if(stage<paths.length){if(progress<durations[stage]){travel=true;break;}progress-=durations[stage];}
   }
   items.forEach((item,index)=>item.classList.toggle('is-current-step',index===stage));
   if(marker.current){
    marker.current.style.opacity=travel?'1':'0';
    if(travel){
     const fraction=progress/durations[stage];
     const eased=durations[stage]>750?fraction*fraction*(3-2*fraction):fraction;
     const point=paths[stage].getPointAtLength(paths[stage].getTotalLength()*eased);
     marker.current.setAttribute('transform',`translate(${point.x} ${point.y})`);
    }
   }
   frame=requestAnimationFrame(tick);
  }
  function sync(){cancelAnimationFrame(frame);previous=0;if(visible&&!reduced.matches&&!document.hidden){frame=requestAnimationFrame(tick);}else hide();}
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.15});observer.observe(root);
  reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();reduced.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);hide();};
 },[lines]);
 useEffect(()=>{
  const root=track.current;if(!root)return;
  let frame=0;
  function measure(){
   const bounds=root!.getBoundingClientRect();
   const items=Array.from(root!.querySelectorAll('li')).map(item=>({body:item.getBoundingClientRect(),title:item.querySelector('.step-title')!.getBoundingClientRect()}));
   const result:Connector[]=[];
   for(let i=0;i<items.length-1;i++){
    const a=items[i],b=items[i+1];
    if(Math.abs(a.title.top-b.title.top)<8){
     const x1=a.title.right-bounds.left+5,x2=b.title.left-bounds.left-5,y=a.title.top-bounds.top+a.title.height/2;
     result.push({key:steps[i]._key,path:`M ${x1} ${y} H ${x2}`,start:[x1,y],end:[x2,y]});
    }else{
     const x1=a.title.left-bounds.left+a.title.width*.6,y1=a.body.bottom-bounds.top+7;
     const x2=b.title.left-bounds.left-5,y2=b.title.top-bounds.top+b.title.height/2;
     const middle=(y1+b.title.top-bounds.top)/2,left=Math.max(2,x2-18),r=7;
     if(bounds.width<650){
      const x=a.title.left-bounds.left+18,endY=b.title.top-bounds.top-5;
      result.push({key:steps[i]._key,path:`M ${x} ${y1} V ${endY}`,start:[x,y1],end:[x,endY]});
     }else{
      result.push({key:steps[i]._key,path:`M ${x1} ${y1} V ${middle-r} Q ${x1} ${middle} ${x1-r} ${middle} H ${left+r} Q ${left} ${middle} ${left} ${middle+r} V ${y2-r} Q ${left} ${y2} ${left+r} ${y2} H ${x2}`,start:[x1,y1],end:[x2,y2]});
     }
    }
   }
   setLines(result);
  }
  function schedule(){cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);}
  const observer=new ResizeObserver(schedule);observer.observe(root);root.querySelectorAll('li').forEach(item=>observer.observe(item));schedule();
  return()=>{observer.disconnect();cancelAnimationFrame(frame);};
 },[steps]);
 return <section className="process wrap" id="proceso"><div className="process-heading"><h2><strong>{title}</strong></h2></div><div className="process-track" ref={track}>
 <svg className="process-connectors" aria-hidden="true">{lines.map(line=><g key={line.key}><path className="connector-path" d={line.path}/><circle cx={line.start[0]} cy={line.start[1]} r="2"/><circle cx={line.end[0]} cy={line.end[1]} r="2"/></g>)}<g ref={marker} className="process-traveller"><circle className="traveller-halo" r="10"/><circle className="traveller-core" r="3"/></g></svg>
 <ol>{steps.map((step,i)=>{const Icon=stepIcons[Number(step._key)]||stepIcons[i%stepIcons.length];return <li key={step._key}><div className="step-title"><Icon className="step-icon" aria-hidden="true"/><h3>{step.title}</h3></div><p>{step.text}</p></li>;})}</ol>
 </div></section>;
}
