/**
 * Bundles src/ into a single self-contained dist/instrumental.html.
 *
 * The output has to be ONE file with no external references apart from Google
 * Fonts — that is a hard constraint of the artifact host, not a style choice.
 * So: esbuild flattens the ES modules, the stylesheets are concatenated in a
 * declared order, and both get inlined into the HTML shell.
 */
import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const minify = process.argv.includes('--minify');

async function bundleJs() {
  const result = await build({
    entryPoints: [path.join(SRC, 'main.js')],
    bundle: true,
    format: 'iife',
    target: ['es2020'],
    minify,
    write: false,
    legalComments: 'none',
  });
  return result.outputFiles[0].text;
}

async function bundleCss() {
  const order = JSON.parse(await readFile(path.join(SRC, 'styles/_order.json'), 'utf8'));
  const parts = [];
  for (const name of order) {
    const file = path.join(SRC, 'styles', `${name}.css`);
    if (!existsSync(file)) throw new Error(`stylesheet listed in _order.json is missing: ${name}.css`);
    parts.push(`/* ---- ${name} ---- */\n` + (await readFile(file, 'utf8')).trim());
  }
  return parts.join('\n\n');
}

const [js, css, shell] = await Promise.all([
  bundleJs(), bundleCss(), readFile(path.join(SRC, 'index.html'), 'utf8'),
]);

for (const token of ['/*{{STYLES}}*/', '/*{{SCRIPT}}*/']) {
  if (!shell.includes(token)) throw new Error(`src/index.html is missing ${token}`);
}

const html = shell
  .replace('/*{{STYLES}}*/', () => '\n' + css + '\n')
  .replace('/*{{SCRIPT}}*/', () => '\n' + js + '\n');

// guard the host's constraints before anything ships
const problems = [];
const externals = [...html.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/g)]
  .map(m => m[1])
  .filter(u => /^(https?:)?\/\//.test(u))
  .filter(u => !/^https:\/\/fonts\.(googleapis|gstatic)\.com/.test(u));
if (externals.length) problems.push(`external references not allowed: ${externals.join(', ')}`);
if (Buffer.byteLength(html) > 16 * 1024 * 1024) problems.push('output exceeds the 16 MB artifact limit');
if (problems.length) { console.error('build failed:\n  ' + problems.join('\n  ')); process.exit(1); }

await mkdir(DIST, { recursive: true });
await writeFile(path.join(DIST, 'instrumental.html'), html);

const kb = n => (n / 1024).toFixed(1) + ' kB';
console.log(`built dist/instrumental.html  ${kb(Buffer.byteLength(html))}` +
            `  (js ${kb(js.length)}, css ${kb(css.length)})${minify ? '  [minified]' : ''}`);
