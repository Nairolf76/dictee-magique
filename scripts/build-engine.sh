#!/usr/bin/env bash
set -euo pipefail
build_root="${DM_BUILD_ROOT:-/var/tmp/dictee-magique-build}"
project_root="$(cd "$(dirname "$0")/.." && pwd)"
source "$build_root/emsdk/emsdk_env.sh"
python3 "$project_root/scripts/patch-mame.py" "$build_root/mame"
cd "$build_root/mame"
embuilder build sdl2 sdl2_ttf
emmake make SUBTARGET=dictee SOURCES=src/mame/ti/snspell.cpp REGENIE=1 OSD=sdl SYMBOLS=0 OPTIMIZE=2 NO_OPENGL=1 NO_USE_PORTAUDIO=1 USE_QTDEBUG=0 -j"${DM_JOBS:-2}"
