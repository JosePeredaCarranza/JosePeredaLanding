export const staticExport=process.env.NEXT_PUBLIC_STATIC_EXPORT==='true';
export function sitePath(path:string){return `${process.env.NEXT_PUBLIC_BASE_PATH||''}${path}`;}
