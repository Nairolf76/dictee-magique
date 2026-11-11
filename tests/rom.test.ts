import { test } from 'node:test';
import assert from 'node:assert/strict';
import { zipSync, strToU8 } from 'fflate';
import { createHash } from 'node:crypto';
import { validateRom } from '../src/rom.js';
const payload = strToU8('synthetic test data, never a proprietary ROM');
const manifest = [{ name: 'test-rom', size: payload.length, sha1: createHash('sha1').update(payload).digest('hex') }];
test('accepts a valid synthetic archive and canonicalizes names', async () => {
  const result = await validateRom(zipSync({ 'clone/renamed.bin': payload }), manifest);
  assert.deepEqual(result.names, ['test-rom']);
  assert.deepEqual(result.files['test-rom'], payload);
});
test('accepts stored ZIPs', async () => { await validateRom(zipSync({ rom: payload }, { level: 0 }), manifest); });
test('ignores unrelated files in merged archives', async () => {
  const result = await validateRom(zipSync({ correct: payload, other: strToU8('unrelated') }), manifest);
  assert.equal(result.names.length, 1);
});
test('reports missing files precisely', async () => { await assert.rejects(validateRom(zipSync({}), manifest), /test-rom.*SHA-1/); });
test('rejects a different model or modified ROM', async () => { await assert.rejects(validateRom(zipSync({ rom: strToU8('wrong model') }), manifest), /française incomplète/); });
test('rejects non-ZIP data', async () => { await assert.rejects(validateRom(payload), /ZIP invalide/); });
test('rejects truncated archives', async () => { await assert.rejects(validateRom(zipSync({ rom: payload }).subarray(0, 30)), /tronquée/); });
test('rejects oversized input', async () => { await assert.rejects(validateRom(new Uint8Array(4194305)), /volumineuse/); });
test('rejects path traversal', async () => { await assert.rejects(validateRom(zipSync({ '../rom': payload }), manifest), /dangereux/); });
test('rejects encrypted flags', async () => {
  const zip = zipSync({ rom: payload }); const v = new DataView(zip.buffer);
  for (let i = 0; i < zip.length - 4; i++) if (v.getUint32(i, true) === 0x02014b50) v.setUint16(i + 8, 1, true);
  await assert.rejects(validateRom(zip, manifest), /chiffré/);
});
test('rejects zip expansion bombs before decompression', async () => {
  const zip = zipSync({ rom: payload }); const v = new DataView(zip.buffer);
  for (let i = 0; i < zip.length - 4; i++) if (v.getUint32(i, true) === 0x02014b50) v.setUint32(i + 24, 9000000, true);
  await assert.rejects(validateRom(zip, manifest), /décompressé/);
});
test('rejects a corrupted ZIP checksum', async () => {
  const zip = zipSync({ rom: payload }, { level: 0 }); zip[33] ^= 1;
  await assert.rejects(validateRom(zip, manifest), /contrôle ZIP/);
});
