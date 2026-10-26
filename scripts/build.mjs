import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import './check.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
// Explicit public allowlist: no source screenshots, documentation, or Git files.
for (const entry of ['index.html', 'styles.css', 'assets']) {
  await cp(path.join(root, entry), path.join(output, entry), { recursive: true });
}
await writeFile(path.join(output, '.nojekyll'), '');
console.log('Production site built in dist/ (no package installation required).');
