import { unzipSync, zipSync } from 'fflate';
import { ROM_MANIFEST, type RomSpec } from './rom-manifest.js';

const MAX_ZIP = 4 * 1024 * 1024;
const MAX_UNPACKED = 8 * 1024 * 1024;
export class RomError extends Error {}

// Inspect directory before decompression: reject ZIP64, encryption, duplicates,
// unsupported compression and expansion bombs. Nothing is extracted to disk.
function inspectZip(bytes: Uint8Array) {
  if (bytes.length > MAX_ZIP) throw new RomError('Archive trop volumineuse (maximum 4 Mo).');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50 && i + 22 + view.getUint16(i + 20, true) === bytes.length) { end = i; break; }
  }
  if (end < 0) throw new RomError('Archive ZIP invalide ou tronquée.');
  const count = view.getUint16(end + 10, true);
  if (view.getUint16(end + 4, true) || view.getUint16(end + 6, true) || count > 256 || count !== view.getUint16(end + 8, true)) throw new RomError('ZIP multipartie, ZIP64 ou trop de fichiers.');
  let p = view.getUint32(end + 16, true);
  if (p + view.getUint32(end + 12, true) !== end) throw new RomError('Répertoire ZIP invalide.');
  let total = 0;
  const checksums = new Map<string, number>();
  for (let n = 0; n < count; n++) {
    if (p + 46 > end || view.getUint32(p, true) !== 0x02014b50) throw new RomError('Répertoire ZIP corrompu.');
    const flags = view.getUint16(p + 8, true), method = view.getUint16(p + 10, true);
    const size = view.getUint32(p + 24, true), nameLength = view.getUint16(p + 28, true);
    const next = p + 46 + nameLength + view.getUint16(p + 30, true) + view.getUint16(p + 32, true);
    if (next > end) throw new RomError('Entrée ZIP tronquée.');
    if (flags & 1 || ![0, 8].includes(method)) throw new RomError('ZIP chiffré ou compression non prise en charge.');
    const name = new TextDecoder().decode(bytes.subarray(p + 46, p + 46 + nameLength));
    if (!name || name.includes('\\') || name.startsWith('/') || name.split('/').includes('..') || checksums.has(name)) throw new RomError('Nom ZIP ambigu, dupliqué ou dangereux.');
    total += size;
    if (total > MAX_UNPACKED || size > MAX_UNPACKED) throw new RomError('Contenu décompressé trop volumineux.');
    checksums.set(name, view.getUint32(p + 16, true));
    p = next;
  }
  if (p !== end) throw new RomError('Taille du répertoire ZIP incohérente.');
  return checksums;
}

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const b of bytes) { crc ^= b; for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); }
  return (crc ^ 0xffffffff) >>> 0;
}

export async function validateRom(bytes: Uint8Array, manifest: readonly RomSpec[] = ROM_MANIFEST) {
  const checksums = inspectZip(bytes);
  let entries: Record<string, Uint8Array>;
  try { entries = unzipSync(bytes); } catch { throw new RomError('Données ZIP corrompues.'); }
  const canonical: Record<string, Uint8Array> = Object.create(null);
  for (const [path, data] of Object.entries(entries)) {
    if (crc32(data) !== checksums.get(path)) throw new RomError(`Somme de contrôle ZIP incorrecte : ${path}`);
    const hash = await crypto.subtle.digest('SHA-1', new Uint8Array(data));
    const sha1 = [...new Uint8Array(hash)].map(n => n.toString(16).padStart(2, '0')).join('');
    for (const spec of manifest) if (spec.size === data.length && spec.sha1 === sha1) canonical[spec.name] = data;
  }
  const missing = manifest.filter(spec => !canonical[spec.name]);
  if (missing.length) throw new RomError('Version française incomplète ou incorrecte. Fichiers attendus : ' + missing.map(s => `${s.name} (${s.size} octets, SHA-1 ${s.sha1})`).join(' ; '));
  // Merged archives may store clone data in subdirectories. Repack only the
  // verified five files under the exact names expected by the pinned driver.
  return { files: canonical, zip: zipSync(canonical), names: Object.keys(canonical) };
}
