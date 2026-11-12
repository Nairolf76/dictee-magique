# La Dictée magique

Réplique web non officielle du jouet Texas Instruments français de 1981.
Moteur MAME 0.289 compilé en WebAssembly : programme original, matrice de touches,
afficheur à segments et synthèse vocale CD2801. Voix originale ou voix française du navigateur au choix.

## Développement

Prérequis : Node.js 22.12 ou supérieur, npm, et un navigateur récent avec WebAssembly et Web Audio.

```powershell
Set-Location -LiteralPath 'C:\Dev\dictee-magique'
npm ci
node scripts/fetch-engine.mjs # ou compiler le moteur ci-dessous
npm test
npm start
```

Ouvrir l'adresse locale indiquée par Vite. Choisir une archive ZIP contenant les
cinq fichiers français. La ROM vérifiée est mémorisée dans IndexedDB sur cet appareil,
sans téléversement, puis rechargée et vérifiée aux visites suivantes. Marche allume
le jeu et le son en un clic, après préparation silencieuse. Effacer ma ROM mémorisée
supprime l'archive locale et recharge la page. Si le navigateur refuse le stockage,
le jeu fonctionne pour la session et explique qu'un nouvel import sera nécessaire.
Aucun compte applicatif, cookie ou suivi.

Le fichier ROM n'est pas fourni dans ce dépôt. Voir [les ressources](docs/resources.md)
et [le manifeste](src/rom-manifest.ts). Une archive « merged » peut contenir plusieurs
modèles ; seuls les cinq fichiers correspondant aux empreintes françaises sont utilisés.
Une archive « split » peut nécessiter les tables PLA du parent : importer une archive
complète ou merged. Les alias de fichiers sont acceptés lorsque leur contenu est identique.

## Compiler le moteur

Utiliser Linux ou l'Ubuntu WSL existant. Prévoir plusieurs Go libres pour les sources,
le SDK et les objets ; aucune installation globale d'Emscripten n'est nécessaire.

Sous Ubuntu, si les outils manquent :

```bash
sudo apt-get update
sudo apt-get install --no-install-recommends build-essential ca-certificates curl xz-utils pkg-config git python3
bash scripts/setup-engine.sh
bash scripts/build-engine.sh
python3 scripts/export-engine.py /var/tmp/dictee-magique-build/mame
```

Depuis PowerShell, les scripts du projet sont accessibles via
`wsl -d Ubuntu -- bash /mnt/c/Dev/dictee-magique/scripts/setup-engine.sh`.
La variable `DM_BUILD_ROOT` permet de choisir un autre répertoire de compilation.
Utiliser la même valeur pour les deux scripts. Les scripts réutilisent les sources
et les objets existants et ne suppriment aucun dossier.

Le SDK est figé à Emscripten 3.1.74 et MAME au commit
`f34f02505e32c1993c6a782b6814232cbfc74e36` (tag `mame0289`). Cette version utilise SDL2 ;
la documentation du dernier MAME peut décrire SDL3, d'où l'importance de ces versions.
Les modifications du moteur sont intégralement décrites dans `scripts/patch-mame.py`.
Le pont utilise l'API publique des ports d'entrée et les segments intégrés du composant PWM.

## Vérifications et distribution

```powershell
npm test
npm run rom:check -- 'chemin\archive.zip'
npm run build
```

Les tests utilisent des données synthétiques, aucune ROM propriétaire.
`rom:check` utilise les fichiers transpilés par `npm test`.
Le dossier `dist` peut être servi par un hébergement statique après compilation du moteur.
Les binaires générés sont exclus de Git ; les scripts permettent de les reconstruire.
Ne jamais placer une ROM dans `public`, `src` ou `dist`.

## Licences

Le code original du projet est sous [licence MIT](LICENSE).
MAME et ses dépendances conservent leurs licences : [notice](THIRD_PARTY_NOTICES.md).
Les ROM, les noms et les marques Texas Instruments ne sont pas couverts par la licence MIT.
Ce projet n'est ni affilié à Texas Instruments ni approuvé par cette société.
MAME classe le son de ce modèle comme imparfait : l'émulation ne garantit pas une
identité acoustique absolue avec un appareil physique.

## État de cette livraison

Moteur compilé et façade opérationnelle. Voir [les vérifications](docs/verification.md).
Le build contrôle les empreintes du moteur et refuse les fichiers ROM connus ou
les archives ROM dans la distribution. `npm run preview` sert le build statique.
Les notices complètes embarquées sont également disponibles dans `public/licenses`.

## Plein écran

Le bouton **Plein écran** affiche uniquement le jouet, droit et centré, ajusté à la fenêtre.
**Échap** ou le bouton discret en haut à droite ramène à la page. Si le navigateur
ne permet pas le plein écran natif, la même vue utilise toute la fenêtre.

## Voix modernes

Le sélecteur **Voix** conserve la voix originale et propose les voix françaises
exposées par le navigateur. **Écouter** permet de tester la sélection. Le jeu
n'utilise pas de clé API ni de service de synthèse ajouté au projet. Les voix
marquées « sur cet appareil » sont locales ; celles marquées « en ligne »
dépendent du service du navigateur et peuvent nécessiter Internet.

Les 142 mots, les lettres et les nombres sont associés aux adresses de parole de
la ROM importée en mémoire ; aucune liste propriétaire n'est embarquée. Les
annonces principales sont reformulées avec la voix moderne. Les annonces non
identifiées restent silencieuses ; le canal original est toujours coupé en mode moderne. Le statut TALK du moteur
reste actif pendant la synthèse moderne pour éviter l'enchaînement prématuré
des annonces. Une erreur ou une attente supérieure à vingt secondes annule
la phrase sans réactiver la voix d'origine. Écouter permet de réessayer et le
sélecteur permet de changer explicitement de voix. Le réglage de volume s'applique aux nouvelles annonces.

Si aucune voix française n'est proposée, utiliser un navigateur qui expose une
voix française, par exemple Chrome ou Edge avec les voix du système disponibles.
La qualité et le nombre des voix dépendent du navigateur et de l'appareil.

## Hébergement gratuit

Voir [la procédure GitHub Pages](docs/hosting.md). Le build utilise des chemins
relatifs et fonctionne aussi dans un sous-dossier. Aucune ROM ne doit être publiée.

Démo : https://nairolf76.github.io/dictee-magique/
Sources : https://github.com/Nairolf76/dictee-magique

Le développement applicatif a été réalisé avec OpenAI Codex sous la direction du
mainteneur. Les vérifications et limites sont décrites dans docs/verification.md.

## Aide à l’import et félicitations

L’aide près du sélecteur de fichier renvoie vers la fiche snspellfr sur Planet
Emulation (site tiers). Son archive merged peut s’appeler snspell.zip ; le validateur
reconnaît le contenu français par ses empreintes, indépendamment du nom du ZIP.
MAME ne propose pas cette ROM dans son catalogue officiel de téléchargements.
Aucun téléchargement tiers automatique ni hébergement de ROM n’est ajouté.
Les quatre variantes de réussite du programme français ont des félicitations
modernes distinctes. Le canal audio original reste coupé en mode moderne.
