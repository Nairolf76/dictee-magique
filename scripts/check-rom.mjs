import { readFile } from 'node:fs/promises';
import { validateRom } from '../.test-build/src/rom.js';
if (!process.argv[2]) { console.error('Usage : npm test puis npm run rom:check -- chemin/archive.zip'); process.exit(1); }
try {
  const result = await validateRom(new Uint8Array(await readFile(process.argv[2])));
  console.log('ROM française vérifiée :\n' + result.names.join('\n'));
} catch (e) { console.error(e.message); process.exitCode = 1; }
