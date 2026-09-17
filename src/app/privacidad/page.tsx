import {getContent} from '@/lib/content';
import {PrivacyContent} from '@/components/PrivacyContent';
export default async function Privacy(){return <PrivacyContent initial={await getContent()}/>;}
