#!/usr/bin/env bash
set -euo pipefail
build_root="${DM_BUILD_ROOT:-/var/tmp/dictee-magique-build}"
revision=f34f02505e32c1993c6a782b6814232cbfc74e36
sdk_revision=3d6d8ee910466516a53e665b86458faa81dae9ba
for tool in git curl tar python3 make gcc g++; do command -v "$tool" >/dev/null || { echo "Outil manquant : $tool" >&2; exit 1; }; done
mkdir -p "$build_root"
if [ ! -d "$build_root/mame" ]; then
  mkdir "$build_root/mame"
  curl -fL --retry 2 "https://codeload.github.com/mamedev/mame/tar.gz/$revision" | tar -xz --strip-components=1 -C "$build_root/mame"
  printf '%s\n' "$revision" > "$build_root/mame/.dm-source-revision"
fi
if [ "$(cat "$build_root/mame/.dm-source-revision" 2>/dev/null || true)" != "$revision" ]; then
  echo 'Dossier MAME existant sans provenance attendue. Utiliser un autre DM_BUILD_ROOT.' >&2; exit 1
fi
if [ ! -d "$build_root/emsdk" ]; then
  git clone --depth 1 --branch 3.1.74 https://github.com/emscripten-core/emsdk.git "$build_root/emsdk"
fi
test "$(git -C "$build_root/emsdk" rev-parse HEAD)" = "$sdk_revision"
"$build_root/emsdk/emsdk" install 3.1.74
"$build_root/emsdk/emsdk" activate 3.1.74
