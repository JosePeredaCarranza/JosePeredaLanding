import Image from 'next/image';
import {photoUrl,type Photo as PhotoType} from '@/lib/public-content';
export function Photo({photo,priority=false,className=''}:{photo:PhotoType;priority?:boolean;className?:string}){
 const src=photoUrl(photo); if(!src)return null;
 return <div className={`photo ${className}`}><Image src={src} alt={photo.alt || ''} fill sizes="(max-width: 700px) 100vw, 50vw" priority={priority} draggable={false}/><span className="photo-shield" aria-hidden="true"/></div>;
}
