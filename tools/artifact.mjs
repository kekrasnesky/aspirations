/**
 * Repackages dist/instrumental.html for hosts that wrap the page in their own
 * document skeleton (claude.ai Artifacts). The game itself is unchanged: this
 * only strips <!DOCTYPE>/<html>/<head>/<body> and the charset/viewport metas.
 *
 *   node tools/artifact.mjs <output.html>
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const out = process.argv[2];
if (!out) { console.error('usage: node tools/artifact.mjs <output.html>'); process.exit(1); }
const src = await readFile(path.join(import.meta.dirname, '..', 'dist/instrumental.html'), 'utf8');

const html = src
  .replace(/<!DOCTYPE html>\s*/i, '')
  .replace(/<\/?(html|head|body)\b[^>]*>\s*/gi, '')
  .replace(/<meta charset[^>]*>\s*/i, '')
  .replace(/<meta name="viewport"[^>]*>\s*/i, '')
  .replace('<title>', '<meta name="claude:viewport-fit-sides" content="cover">\n<title>');

if (/<(html|head|body)[\s>]/i.test(html)) throw new Error('skeleton tags survived');
await writeFile(out, html);
console.log(`wrote ${out}  ${(Buffer.byteLength(html) / 1024).toFixed(1)} kB`);
