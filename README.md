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


## Listes personnelles

L’onglet **Mes listes de révision** fonctionne sans ROM. Créer, modifier, dupliquer ou
supprimer une liste ; la saisie rapide accepte une expression par ligne. Les
articles, espaces et accents sont conservés : « la mère », « les cheveux ».
Chaque expression peut recevoir une phrase de contexte, lue mais non demandée
dans la réponse. Les voix locales fr-CA sont proposées en priorité, puis les
autres voix françaises locales. Une voix en ligne est signalée explicitement.
La sélection manuelle des voix modernes et le volume sont partagés avec le jouet.

Choisir une ou plusieurs listes, Entraînement ou Dictée blanche, réponse au
clavier ou sur papier. Les mots sont mélangés par défaut. En entraînement,
deux essais sont permis ; l’aide révèle la réponse et la compte « à revoir ».
La dictée blanche garde les corrections pour le bilan. Sur papier, les résultats
sont renseignés manuellement. Le bilan distingue premier essai, nouvel essai et
mots à revoir ; seuls ces derniers peuvent être rejoués.

La comparaison accepte la casse, les espaces superflus, les caractères Unicode
équivalents et les apostrophes droites ou typographiques. Elle exige les accents,
les articles et le pluriel : « ou » et « où », « bleu » et « bleue » restent distincts.

La séance est commune à l’espace révision et à la façade du jouet. Le champ
complet, la touche Espace et la palette d’accents permettent les expressions
longues. Départ avance, Répète relit, Essaie valide, Efface corrige et Aide révèle
la réponse en entraînement. Les commandes historiques sans équivalent sont
désactivées. Le changement de présentation conserve la séance ; revenir au jeu
original met la révision en pause. MAME reste muet et ne reçoit aucune saisie
pendant les exercices personnels. La frappe n’épelle pas les lettres.

### Importer et sauvegarder

Les modèles publics sont disponibles dans l’interface et dans
`public/templates/modele-listes.csv` et `public/templates/modele-listes.json`.
CSV UTF-8 : colonnes `liste;texte;contexte`, séparateur point-virgule ou virgule,
champs entre guillemets, guillemets doublés et fins de ligne Windows acceptés.
JSON version 1 :

```json
{"version":1,"lists":[{"title":"Semaine 1","entries":[{"text":"une étoile","context":"Une étoile brille dans le ciel."}]}]}
```

L’aperçu précède l’ajout de nouvelles copies ; aucun remplacement silencieux.
Les doublons sont signalés et conservés. Maximum 2 Mo par import, 100 listes et
500 entrées par liste. Une erreur rejette l’ensemble du fichier. Exporter une
liste ou toute la bibliothèque produit ce même JSON, sans ROM, voix ou résultats.

La base IndexedDB existante est migrée de v1 à v2 sans effacer la ROM. Listes,
préférences, dernier bilan par liste et cartouches sont séparés. Aucun profil
d’enfant ni historique détaillé. Si le stockage est refusé, les listes restent
utilisables en mémoire et exportables pendant la session. Le navigateur peut
effacer ses données : conserver des exports pour les sauvegardes. Pas de
synchronisation entre appareils ni d’envoi au serveur applicatif.

## Cartouches françaises

Le panneau **Cartouches françaises** reconnaît les modules nº 1 Les Mots de Base,
nº 2 Les Mots Difficiles et nº 4 Les Magasins de la Rue. Importer un ZIP ou une ROM
brute : taille et SHA-1 officiels identifient le module indépendamment du nom.
La ROM principale française reste nécessaire. Les cartouches importées sont
mémorisées séparément et peuvent être effacées individuellement.

Sélectionner le module, puis **Charger et redémarrer**. Après Marche, appuyer sur
**Module**, choisir A/B/C/D, puis Départ. Le changement redémarre la page ; aucun
remplacement à chaud. Le moteur charge le fichier dans son système de fichiers
virtuel avec `-cart`, à l’adresse native 0x8000. Les voix modernes décodent les
tables du module importé tout en conservant lettres et annonces de la ROM principale.
Les vocabulaires ne sont pas distribués. MAME brut reste la référence pour la
voix originale ; aucun traitement expérimental n’est appliqué.

Les empreintes et sources sont décrites dans [les ressources](docs/resources.md).
Les essais réels privés et leurs limites sont consignés dans
[les vérifications](docs/verification.md). Aucun fichier scolaire personnel,
photographie, ROM, cartouche ou audio extrait n’est inclus dans la distribution.


## Marquages du jouet

Les touches utilisent des pictogrammes SVG et les couleurs du clavier photographié. Le logo français et TI/Speak & Spell sont redessinés sur la partie basse jaune, suivant la variante Etsy de 1981. Les fontes système peuvent modifier légèrement la typographie selon l’appareil. Ces marques restent celles de leurs propriétaires ; les photographies de référence et les fontes ne sont pas distribuées. Voir docs/resources.md pour les références et limites de fidélité.
