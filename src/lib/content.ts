import 'server-only';
import {cache} from 'react';
import defaults from '@/content/defaults.json';
import {staticExport} from './paths';
import {client,CONTENT_QUERY,mergeContent,type Content} from './public-content';
export type {Content,Photo,Project} from './public-content';
export {client,photoUrl,safeUrl} from './public-content';
export const getContent=cache(async():Promise<Content>=>{
 if(!client)return defaults as Content;
 const data=await client.fetch<Content|null>(CONTENT_QUERY,{}, {next:{revalidate:staticExport?false:60}});
 return data?mergeContent(data):defaults as Content;
});
