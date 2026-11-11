"""Export only generated engine files and upstream license, never ROMs."""
from pathlib import Path
import hashlib
import json
import sys

source = Path(sys.argv[1]).resolve()
project = Path(__file__).resolve().parent.parent
target = project / 'public' / 'engine'
target.mkdir(parents=True, exist_ok=True)
files = ['dictee.js', 'dictee.wasm']
for name in files:
    if not (source / name).is_file():
        raise SystemExit(f'Moteur incomplet : {name}')
hashes = {}
for name in files:
    content = (source / name).read_bytes()
    (target / name).write_bytes(content)
    hashes[name] = hashlib.sha256(content).hexdigest()
license_path = project / 'vendor' / 'mame'
license_path.mkdir(parents=True, exist_ok=True)
(license_path / 'COPYING').write_bytes((source / 'COPYING').read_bytes())
public_licenses = project / 'public' / 'licenses' / 'mame'
public_licenses.mkdir(parents=True, exist_ok=True)
(public_licenses / 'COPYING').write_bytes((source / 'COPYING').read_bytes())
for item in (source / 'docs' / 'legal').rglob('*'):
    if item.is_file():
        out = public_licenses / 'legal' / item.relative_to(source / 'docs' / 'legal')
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes(item.read_bytes())
sdk = source.parent / 'emsdk' / 'upstream' / 'emscripten'
if (sdk / 'LICENSE').is_file():
    (project / 'public' / 'licenses' / 'emscripten.txt').write_bytes((sdk / 'LICENSE').read_bytes())
ports = sdk / 'cache' / 'ports'
for item in ports.rglob('*'):
    if item.is_file() and item.name.upper().startswith(('LICENSE','COPYING','COPYRIGHT')):
        out = project / 'public' / 'licenses' / 'ports' / item.relative_to(ports)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes(item.read_bytes())
(target / 'build.json').write_text(json.dumps({
    'mame': '0.289', 'revision': 'f34f02505e32c1993c6a782b6814232cbfc74e36',
    'emscripten': '3.1.74', 'sha256': hashes,
    'features': ['speech-events', 'modern-talk-status']
}, indent=2) + '\n')
print(json.dumps(hashes, indent=2))
