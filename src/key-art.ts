import type { ToyKey } from './keys';

// Original vector drawings of the printed French 1981 key marks.
// Presentation only: the emulated matrix and key labels stay in keys.ts.
const marks: Record<string, string> = {
  Rejoue: '<path d="M17 9h6a11 11 0 0 1 0 22H11v5L2 28l9-8v5h12a5 5 0 0 0 0-10h-6z"/>',
  'Répète': '<path d="m12 11 5 2-7 14-5-2zm13 0 5 2-7 14-5-2z"/>',
  Aide: '<path d="M7 17h26v6H7z"/>',
  'Mot mystère': '<path d="M9 12C9 5 15 2 21 2c8 0 13 4 13 11 0 6-4 9-9 12-2 1-2 3-2 5h-7c0-5 1-7 5-10 4-2 6-4 6-7 0-3-2-5-6-5-3 0-5 2-5 5zM16 33h7v7h-7z"/>',
  'Code secret': '<path d="M20 4a9 9 0 0 0-5 16l-4 17h18l-4-17A9 9 0 0 0 20 4z"/>',
  Lettre: '<g transform="translate(12 1) scale(.39)"><path d="M9 12C9 5 15 2 21 2c8 0 13 4 13 11 0 6-4 9-9 12-2 1-2 3-2 5h-7c0-5 1-7 5-10 4-2 6-4 6-7 0-3-2-5-6-5-3 0-5 2-5 5zM16 33h7v7h-7z"/></g><g transform="translate(1 20) scale(.39)"><path d="M9 12C9 5 15 2 21 2c8 0 13 4 13 11 0 6-4 9-9 12-2 1-2 3-2 5h-7c0-5 1-7 5-10 4-2 6-4 6-7 0-3-2-5-6-5-3 0-5 2-5 5zM16 33h7v7h-7z"/></g><g transform="translate(23 20) scale(.39)"><path d="M9 12C9 5 15 2 21 2c8 0 13 4 13 11 0 6-4 9-9 12-2 1-2 3-2 5h-7c0-5 1-7 5-10 4-2 6-4 6-7 0-3-2-5-6-5-3 0-5 2-5 5zM16 33h7v7h-7z"/></g>',
  'Dis-le': '<circle cx="13" cy="11" r="4.2"/><circle cx="27" cy="11" r="4.2"/><path d="M5 20h30a15 15 0 0 1-30 0z"/>',
  Module: '<path d="M10 4h6v6h8V4h6v6h6v6h-6v8h6v6h-6v6h-6v-6h-8v6h-6v-6H4v-6h6v-8H4v-6h6zm6 12v8h8v-8z" fill-rule="evenodd"/>',
  Efface: '<path d="m12 5 6-2 11 32-6 2z"/>',
  Essaie: '<path d="m20 3 15 17h-9v16H14V20H5z"/>',
};

const legends: Record<string, readonly string[]> = {
  Rejoue: ['REJOUE'], 'Répète': ['REPETE'], Aide: ['AIDE'],
  'Mot mystère': ['MOT', 'MYSTERE'], 'Code secret': ['CODE', 'SECRET'],
  Lettre: ['LETTRE'], 'Dis-le': ['DIS-LE'], 'Épelle / Marche': ['EPELLE'],
  Module: ['MODULE'], Efface: ['EFFACE'], Essaie: ['ESSAIE'],
};

/** Call once while creating a button. Does not set or modify accessible names. */
export function appendKeyArt(button: HTMLButtonElement, spec: ToyKey): void {
  button.dataset.keyArt = spec.keyboard;
  const face = document.createElement('span');
  face.className = 'key-face';
  face.setAttribute('aria-hidden', 'true');
  if (marks[spec.label]) {
    face.innerHTML = `<svg class="key-mark" viewBox="0 0 40 40" aria-hidden="true" focusable="false">${marks[spec.label]}</svg>`;
  } else {
    face.textContent = spec.label === 'Épelle / Marche' ? 'MARCHE' : spec.symbol;
    if (['Arrêt', 'Départ', 'Épelle / Marche'].includes(spec.label)) face.classList.add('key-face-word');
  }
  button.append(face);
  const words = legends[spec.label];
  if (!words) return;
  const legend = document.createElement('span');
  legend.className = `legend key-legend${words.length === 2 ? ' key-legend-double' : ''}`;
  legend.setAttribute('aria-hidden', 'true');
  for (const word of words) {
    const line = document.createElement('span');
    line.textContent = word;
    legend.append(line);
  }
  button.append(legend);
}
