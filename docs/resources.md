# Ressources et provenance

Recherches du 11 novembre 2026. Les liens constituent des références ; leur contenu
n'est pas automatiquement redistribuable. Aucune photo, vidéo ou piste audio tierce
n'est incluse dans les fichiers publiables du projet.

| Ressource | Usage | Réutilisation |
| --- | --- | --- |
| [MAME, pilote snspell.cpp figé](https://github.com/mamedev/mame/blob/mame0289/src/mame/ti/snspell.cpp) | Identification du modèle français, empreintes, touches, CD2801 | Pilote BSD-3-Clause ; ensemble MAME sous ses propres licences |
| [MAME, compilation de cette version](https://github.com/mamedev/mame/blob/mame0289/docs/source/initialsetup/compilingmame.rst) | Procédure Emscripten / SDL2 | Documentation amont |
| [Emscripten](https://emscripten.org/docs/getting_started/downloads.html) | SDK de compilation | Licences amont conservées |
| [Speak & Spell JS, Shannon Carey](https://sha.nnoncarey.com/) | Comparaison des jeux et de l'expérience web anglophone | Licence de réutilisation non établie ; aucun code repris |
| [SASS et autres simulateurs, Emu-France](https://www.emu-france.com/emulateurs/8-jeux-electroniques/174-speak-and-spell-simulator-la-dictee-magique/) | Inventaire des projets existants | Référence seulement |
| [furrtek/SpeakAndSpellTi](https://github.com/furrtek/SpeakAndSpellTi) | Code commenté du brevet, référence historique | Aucun code repris |
| [Emularity](https://github.com/db48x/emularity) | Chargeur d'émulateurs web cité par MAME | Aucun code repris |
| [Photos du modèle français, Lulu Berlu](https://www.lulu-berlu.com/texas-instruments-speak-spell-french-version-with-box-a21279-en.html) | Proportions, couleurs, inscriptions et touches | Référence visuelle uniquement ; pas de photo embarquée |
| [Temps X, présentation de 1981](https://www.dailymotion.com/video/xzg589) | Référence audiovisuelle historique | Pas de téléchargement ou d'extrait audio redistribué |
| [Planet Emulation, snspellfr](https://www.planetemu.net/en/rom/mame-roms-merged/snspellfr) | Archive identifiée pour l'essai local | Autorisation de redistribution non établie ; exclue du projet |

## Contenu attendu

| Fichier canonique | Octets | SHA-1 |
| --- | ---: | --- |
| cd2702an2l | 4096 | a8bc118c83a84260033734191dcaa71a93dfa52b |
| tms0980_common1_instr.pla | 1246 | 2d127d98028ec8ec6ea10c179c25e447b14ba4d0 |
| tms0270_common1_micro.pla | 2127 | 67b691e7c0b97239410587e50e5182bf46475b43 |
| tms0270_cd2702_output.pla | 1246 | 9a8ac690902731e1e01533279a1c9223011e1537 |
| cd2352 | 16384 | e16043766c385e152b7005c1c010be4c5fccdd9b |

La mémoire vocale contient les données de synthèse du vocabulaire français ; le
moteur CD2801 de MAME les joue en exécutant le programme. Aucun découpage en samples
ni extraction de voix d'une vidéo n'est nécessaire.

## Synthèse vocale du navigateur

- [Web Speech API](https://webaudio.github.io/web-speech-api/) : choix des voix, langue, volume et événements de fin/erreur.
- [Format historique des ROM, furrtek](https://github.com/furrtek/SpeakAndSpellTi/blob/master/rom.txt) : référence de recherche. Le modèle français diffère du modèle américain ; ses tables ont été vérifiées sur la ROM chargée (alphabet à 0x10, nombres à 0x70). Aucun code de ce dépôt n'est repris.
- Les voix ne sont pas redistribuées : elles sont fournies par le navigateur ou le système. Leur disponibilité et leurs conditions dépendent de leur fournisseur.
