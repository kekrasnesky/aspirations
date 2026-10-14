import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
execFileSync('node', ['tools/build.mjs'], { cwd: root });
const html = readFileSync(path.join(root, 'dist/instrumental.html'), 'utf8');

test('output is one file under 16 MB', () => {
  assert.ok(statSync(path.join(root, 'dist/instrumental.html')).size < 16 * 1024 * 1024);
});
test('only Google Fonts are referenced externally', () => {
  const ext = [...html.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/g)].map(m => m[1])
    .filter(u => /^(https?:)?\/\//.test(u)).filter(u => !/^https:\/\/fonts\.(googleapis|gstatic)\.com/.test(u));
  assert.deepEqual(ext, []);
});
test('placeholders were all replaced', () => {
  assert.ok(!html.includes('{{STYLES}}') && !html.includes('{{SCRIPT}}'));
});
test('honours reduced motion and safe-area insets', () => {
  assert.match(html, /prefers-reduced-motion/);
  assert.match(html, /safe-area-inset/);
});
test('localStorage is only touched inside try blocks', () => {
  const src = readFileSync(path.join(root, 'src/game/persist.js'), 'utf8') + readFileSync(path.join(root, 'src/main.js'), 'utf8');
  for (const m of src.matchAll(/localStorage/g)) {
    const before = src.slice(Math.max(0, m.index - 120), m.index);
    assert.match(before, /try\s*\{/, 'localStorage outside try');
  }
});
