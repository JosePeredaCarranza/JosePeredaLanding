import {defineCliConfig} from 'sanity/cli';
export default defineCliConfig({api:{projectId:process.env.SANITY_STUDIO_PROJECT_ID||'16asym1c',dataset:process.env.SANITY_STUDIO_DATASET||'production'},deployment:{appId:'qgxhlz0gv6knug6at6qyka0a'},studioHost:process.env.SANITY_STUDIO_HOSTNAME||'jose-pereda-16asym1c'});
