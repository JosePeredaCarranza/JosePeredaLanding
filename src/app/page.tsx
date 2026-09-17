import {getContent} from '@/lib/content';
import {Landing} from '@/components/Landing';
export default async function Home(){return <Landing initial={await getContent()}/>;}
