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

## Aide à l’import publiée

Le [catalogue officiel MAME](https://www.mamedev.org/roms/) ne propose pas snspellfr.
La [fiche française Planet Emulation](https://www.planetemu.net/rom/mame-roms-merged/snspellfr)
indique une archive merged snspell.zip regroupant les variantes. Le lien présent
dans l’aide ouvre cette fiche tierce ; aucun téléchargement n’est automatisé.
La disponibilité publique n’établit pas un droit de redistribution. Le projet
ne fournit, ne copie et n’héberge pas la ROM. Consultation : 11 novembre 2026.


## Cartouches françaises

Source officielle des empreintes : [MAME 0.289, liste snspell](https://github.com/mamedev/mame/blob/mame0289/hash/snspell.xml).
Chaque module français occupe 16 384 octets. Le pilote utilise le connecteur de
cartouche natif et la banque vocale à partir de 0x8000.

| Module | Fichier | SHA-1 |
| --- | --- | --- |
| Nº 1 Les Mots de Base | cd2353 | 3bebf4370be3e6e5fff86d2ee27ff56f17368ba6 |
| Nº 2 Les Mots Difficiles | cd62177a | 1d611f4a15d05f55f0da1773bddbfd64f2d63a49 |
| Nº 4 Les Magasins de la Rue | cd62048 | 479eaecaadb31bdd99e9bb0f424191ec554202bd |

Les fichiers utilisés uniquement pour les essais locaux proviennent de la
[collection publique MAME 0.228 Software List ROMs merged](https://archive.org/details/MAME_0.228_Software_List_ROMs_merged),
répertoires snspell/motsbase.zip, motsdiff.zip et magasrue.zip. Les trois SHA-1
correspondent à la liste officielle. Consultation : 12 novembre 2026.
Une autre collection, mame-sl, demande une connexion et n’a pas été utilisée.
La mise à disposition publique n’établit aucun droit de redistribution : ces
fichiers restent privés, hors Git et hors site. Aucun lien de téléchargement
automatique n’est ajouté à l’application.

Les tableaux de mots sont décodés depuis les cartouches importées, sans copie
statique de leur vocabulaire. Les modules 2 et 4 omettent le marqueur haut du
premier caractère présent sur le module 1 ; leurs pointeurs incluent 0x8000.
Les voix modernes sont celles du système ou du navigateur et ne sont pas fournies.

Les modèles de listes publics sont des exemples génériques créés pour le projet.
La photo scolaire et sa transcription privée ne sont pas des ressources du dépôt.


## Marquages de la façade

Les pictogrammes et logos redessinés suivent les
[photos Etsy de RetroCite fournies par l’utilisateur](https://www.etsy.com/listing/4505314086/vintage-texas-instruments-la-dictee).
Consultation : 12 novembre 2026. Les photos restent hors du dépôt et ne sont pas
redistribuées. La photo Facebook complémentaire montre une autre variante de
marquage ; la façade Etsy est retenue pour garder une version cohérente.

Les pictogrammes sont dessinés en SVG ; les marques commerciales et silhouettes
de logos sont des reconstitutions visuelles, pas des fichiers maîtres officiels.
La typographie utilise uniquement des fontes système (Cooper Black si présente,
puis Georgia/serif, Times et Arial). Aucun fichier de fonte, glyphe extrait ou
photo n’est embarqué. L’aspect des lettres peut varier selon les fontes installées.
Les noms, logos et marques Texas Instruments/Speak & Spell ne sont pas couverts
par la licence MIT du code. La main, les étoiles et les proportions restent des
approximations des impressions photographiées.
