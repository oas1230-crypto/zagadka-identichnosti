import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const css = await readFile(path.join(root, 'styles.css'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(new Set(ids).size, ids.length, 'Duplicate HTML id');
assert.equal((html.match(/<h1\b/g) || []).length, 1, 'Exactly one h1 required');
assert.equal((html.match(/<main\b/g) || []).length, 1, 'Exactly one main required');
assert.ok(html.includes('lang="ru"'), 'Russian language required');
assert.ok(html.includes('href="tel:+375296365143"'), 'Expected organizer phone');
assert.ok(html.includes('datetime="2026-11-27"') && html.includes('datetime="2026-11-29"'), 'Expected event dates');
assert.ok(!/<form\b|href="#"|javascript:/i.test(html), 'No fake forms or placeholder links');
assert.ok(!/telegram|t\.me\//i.test(html), 'Telegram excluded by organizer request');
assert.ok(css.includes('prefers-reduced-motion'), 'Reduced motion support required');

const assets = new Set();
for (const [, attribute, value] of html.matchAll(/\b(href|src)="([^"]+)"/g)) {
  if (value.startsWith('#')) assert.ok(ids.includes(value.slice(1)), `Missing anchor: ${value}`);
  else if (/^(https:|tel:)/.test(value)) continue;
  else {
    assert.ok(!value.startsWith('/') && !value.includes('..'), `Use relative public paths: ${value}`);
    assets.add(value);
  }
}
for (const [, value] of css.matchAll(/url\("([^"]+)"\)/g)) assets.add(value);
for (const asset of assets) await access(path.join(root, asset));
for (const [tag] of html.matchAll(/<img\b[^>]+>/g)) {
  assert.ok(/\balt="[^"]+"/.test(tag), 'Image requires descriptive alt');
  assert.ok(/\bwidth="\d+"/.test(tag) && /\bheight="\d+"/.test(tag), 'Image requires dimensions');
}
console.log(`Static checks passed: ${assets.size} local resources, all anchors, metadata, contacts and image attributes.`);
