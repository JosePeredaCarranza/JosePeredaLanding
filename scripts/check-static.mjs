import { readFile, access } from 'node:fs/promises';
import { join } from 'node:path';
const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
const domain = await readFile('out/CNAME', 'utf8').catch(() => '');
if (domain.trim() && base) {
  throw new Error('Custom-domain deployment must not contain a repository basePath');
}
for (const file of ['index.html', 'privacidad/index.html']) {
  const html = await readFile(join('out', file), 'utf8');
  for (const tag of html.matchAll(/<(?:img|script|link|a)\b[^>]*>/g)) {
    if (tag[0].includes('rel="preconnect"')) continue;
    const url = tag[0].match(/(?:src|href)="(\/[^\"]*)"/)?.[1];
    if (!url) continue;
    if (!url.startsWith(base + '/')) throw new Error(`Path outside basePath: ${url}`);
    const relative = url.slice(base.length + 1).split(/[?#]/)[0];
    await access(join('out', relative.endsWith('/') ? relative + 'index.html' : relative));
  }
}
const home = await readFile('out/index.html', 'utf8');
if (!home.includes('name="stage"') || home.includes('name="marketing"'))
  throw new Error('Static contact fallback missing');
console.log('Static assets, privacy links and contact mode verified.');
