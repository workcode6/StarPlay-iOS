import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

export const digest = bytes => createHash('sha256').update(bytes).digest('hex');

export async function verifyWebAssets(directory, { requireManifest = true } = {}) {
  const root = path.resolve(directory);
  const index = await fs.readFile(path.join(root, 'index.html'), 'utf8');
  if (!/<(?:div|main)\b[^>]*\bid=["']root["']/i.test(index)) throw new Error('Renderer root is missing; placeholder HTML is not an application');
  const references = [...index.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css)(?:\?[^"']*)?)["']/g)].map(match => match[1]);
  if (!references.some(ref => /\.js(?:\?|$)/.test(ref)) || !references.some(ref => /\.css(?:\?|$)/.test(ref))) throw new Error('Renderer must reference built JavaScript and CSS');
  for (const reference of references) {
    if (/^(?:[a-z]+:|\/\/)/i.test(reference)) throw new Error('Renderer assets must be packaged locally: ' + reference);
    const file = path.resolve(root, decodeURIComponent(reference.split('?')[0]).replace(/^\/+/, ''));
    if (!file.startsWith(root + path.sep)) throw new Error('Asset escapes web directory');
    if (!(await fs.stat(file)).size) throw new Error('Empty renderer asset: ' + reference);
  }
  if (!requireManifest) return { references };
  const manifest = JSON.parse(await fs.readFile(path.join(root, 'renderer-assets.json'), 'utf8'));
  if (!manifest.sourceCommit || !manifest.packageVersion || !manifest.files?.['index.html']) throw new Error('Renderer provenance is incomplete');
  for (const [name, hash] of Object.entries(manifest.files)) {
    const file = path.resolve(root, name);
    if (!file.startsWith(root + path.sep) || digest(await fs.readFile(file)) !== hash) throw new Error('Renderer hash mismatch: ' + name);
  }
  for (const reference of references) {
    const name = decodeURIComponent(reference.split('?')[0]).replace(/^(?:\.\/|\/)+/, '');
    if (!manifest.files[name]) throw new Error('Referenced asset is absent from manifest: ' + name);
  }
  return { sourceCommit: manifest.sourceCommit, packageVersion: manifest.packageVersion, fileCount: Object.keys(manifest.files).length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { console.log(JSON.stringify(await verifyWebAssets(process.argv[2] || 'www'))); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
