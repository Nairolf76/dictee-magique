// Facts from MAME mame0289, src/mame/ti/snspell.cpp, ROM_START(snspellfr).
export const ROM_MANIFEST = [
  { name: 'cd2702an2l', size: 4096, sha1: 'a8bc118c83a84260033734191dcaa71a93dfa52b' },
  { name: 'tms0980_common1_instr.pla', size: 1246, sha1: '2d127d98028ec8ec6ea10c179c25e447b14ba4d0' },
  { name: 'tms0270_common1_micro.pla', size: 2127, sha1: '67b691e7c0b97239410587e50e5182bf46475b43' },
  { name: 'tms0270_cd2702_output.pla', size: 1246, sha1: '9a8ac690902731e1e01533279a1c9223011e1537' },
  { name: 'cd2352', size: 16384, sha1: 'e16043766c385e152b7005c1c010be4c5fccdd9b' }
] as const;
export type RomSpec = { readonly name: string; readonly size: number; readonly sha1: string };
