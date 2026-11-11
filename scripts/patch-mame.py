"""Reproducible browser bridge; modern mode optionally extends speech TALK status."""
from pathlib import Path
import sys

root = Path(sys.argv[1])
def replace(path, old, new):
    p = root / path
    text = p.read_text()
    if new in text:
        return
    if text.count(old) != 1:
        raise SystemExit(f'Upstream anchor mismatch: {path}')
    p.write_text(text.replace(old, new))

replace('scripts/genie.lua', "['cwrap']", "['cwrap', 'FS', 'callMain']")
# This release's Emscripten defaults select SDL3, while OSD=sdl is SDL2.
# Keep headers and linked port ABI consistent with the chosen OSD.
p = root / 'scripts/genie.lua'
text = p.read_text()
for old, new in [('USE_SDL_TTF=3', 'USE_SDL_TTF=2'), ('USE_SDL=3', 'USE_SDL=2')]:
    if old not in text and new not in text:
        raise SystemExit('SDL port anchor missing')
    text = text.replace(old, new)
p.write_text(text)
replace('src/mame/ti/snspell.cpp', '#include "emu.h"', '''#include "emu.h"
#ifdef __EMSCRIPTEN__
#include <emscripten.h>
static running_machine *dm_machine = nullptr;
extern "C" {
EMSCRIPTEN_KEEPALIVE int dm_key(int row, int mask, int pressed)
{
    if (!dm_machine || row < 0 || row > 8 || mask < 1 || mask > 16 || (mask & (mask - 1))) return 0;
    auto *port = dm_machine->root_device().ioport(util::string_format("IN.%d", row));
    auto *field = port ? port->field(mask) : nullptr;
    if (!field) return 0;
    field->set_value(pressed ? 1 : 0);
    return 1;
}
EMSCRIPTEN_KEEPALIVE void dm_reset()
{
    if (dm_machine) dm_machine->schedule_soft_reset();
}
}
#endif''')
replace('src/mame/ti/snspell.cpp', 'void snspell_state::machine_start()\n{', '''void snspell_state::machine_start()
{
#ifdef __EMSCRIPTEN__
    dm_machine = &machine();
    EM_ASM({ if (Module.onMachineReady) Module.onMachineReady(); });
#endif''')
replace('src/devices/video/pwm.cpp', '#include "emu.h"', '''#include "emu.h"
#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#endif''')
replace('src/devices/video/pwm.cpp', '// output to digity (single brightness level)', '''// Browser receives the same PWM-integrated segments as MAME artwork.
#ifdef __EMSCRIPTEN__
            if (y < 8) EM_ASM({ if (Module.onDigit) Module.onDigit($0, $1); }, y, unsigned(digit_row));
#endif
            // output to digity (single brightness level)''')
print('Browser bridge patched (idempotent).')

replace('src/osd/modules/sound/js_sound.js', 'sample_count: sample_count', '''sample_count: sample_count,
    set_volume: function(value) { if (gain_node) gain_node.gain.value = value; },
    get_gain: function() { return gain_node; }''')
replace('src/osd/modules/sound/js_sound.js', 'gain_node.gain.value = 1.0;', 'gain_node.gain.value = 0.0; // Explicit user activation in the web application.')
post = root / 'scripts/resources/emscripten/emscripten_post.js'
original = post.read_text().split('\nModule.dmResumeAudio =')[0]
post.write_text(original + '''
Module.dmResumeAudio = function() {
    if (typeof jsmame_web_audio !== 'undefined' && jsmame_web_audio.get_context()) {
        Module.dmVolume(Module.dmGainValue ?? 0.7);
        return jsmame_web_audio.get_context().resume();
    }
};
Module.dmVolume = function(value) {
    Module.dmGainValue = Math.max(0, Math.min(1, value));
    if (typeof jsmame_web_audio !== 'undefined') jsmame_web_audio.set_volume(Module.dmGainValue);
};
''')

# Optional modern speech: observe the VSM address and extend only the TALK flag.
replace('src/devices/machine/tms6100.h',
    'void enable_4bit_mode(bool mode) { m_4bit_mode = mode; }',
    '''void enable_4bit_mode(bool mode) { m_4bit_mode = mode; }
    u32 dm_address() const { return m_address; }''')
replace('src/devices/sound/tms5110.cpp', '#include "emu.h"', '''#include "emu.h"
#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#include "machine/tms6100.h"
#endif''')
replace('src/devices/sound/tms5110.cpp', 'case CMD_SPEAK:', '''case CMD_SPEAK:
#ifdef __EMSCRIPTEN__
                    {
                        auto *vsm = machine().root_device().subdevice<tms6100_device>("tms6100");
                        if (vsm) EM_ASM({ if (Module.onSpeech) Module.onSpeech($0); }, unsigned(vsm->dm_address()));
                    }
#endif''')
replace('src/devices/sound/tms5110.cpp', 'if (m_state == CTL_STATE_TTALK_OUTPUT)\n\t{', '''if (m_state == CTL_STATE_TTALK_OUTPUT)
    {
#ifdef __EMSCRIPTEN__
        if (EM_ASM_INT({ return Module.dmSpeechBusy ? 1 : 0; })) return 1;
#endif''')
