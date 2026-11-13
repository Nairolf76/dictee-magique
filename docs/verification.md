# Vérifications du 11 novembre 2026

## Résultats

- MAME 0.289, commit `f34f02505e32c1993c6a782b6814232cbfc74e36`, compilé avec Emscripten 3.1.74 sous Ubuntu WSL.
- Les cinq fichiers de l'archive française de test correspondent aux SHA-1 du manifeste officiel.
- 16 tests automatisés passent : archives valides, incorrectes et corrompues, limites de taille, contrôle CRC, gestion des appuis et relâchements.
- Chromium bureau : démarrage français, afficheur EPELLE A, entrée au clavier, activation d'un bouton avec Entrée, volume au clavier, marche/arrêt et réinitialisation.
- Série complète de dix mots jouée avec deux réponses incorrectes par mot ; corrections et bilan final observés. Le programme ignore certaines entrées pendant ses annonces : attendre la fin de la voix avant de répondre.
- Code secret et Lettre : changement de mode et lettre générée observés. Dis-le : affichage et audio observés. Mot mystère : tirets affichés ; Aide révèle des lettres.
- Répète : sortie vocale mesurée (pic Web Audio non nul) ; la machine reste en attente de réponse.
- Audio initialement muet ; activation explicite vérifiée. Gain 20 % vérifié au clavier. Aucune synthèse vocale de remplacement.
- Chromium mobile simulé à 390 × 844 : import, démarrage, activation audio, touche B et annulation tactile vérifiés. Aucun débordement horizontal. Aucun téléphone physique testé.
- Inspection visuelle séparée des vues bureau et mobile, à partir des photographies françaises de référence.
- Build TypeScript/Vite, empreintes SHA-256 du moteur et audit de distribution : réussis.
- Aucun POST pour importer une ROM ; archive conservée uniquement dans la mémoire de la page. Les essais utilisent une archive privée située hors du projet publiable.

## Limites connues

Le pilote MAME signale `MACHINE_IMPERFECT_SOUND`. Le backend Web Audio amont utilise
ScriptProcessorNode, encore fonctionnel dans le Chromium testé mais déprécié par
les navigateurs. Le projet ne prétend pas garantir une identité acoustique absolue
avec le jouet physique. Le toucher a été vérifié en émulation mobile et par des
événements tactiles du navigateur, sans appareil mobile physique.

Les ROM et les extensions par cartouche ne sont pas distribuées. L'archive ZIP de
test, les historiques détaillés de la partie et les images intermédiaires restent
hors du dépôt. Aucune publication GitHub ni mise en ligne n'a été effectuée.

## Plein écran

Ajout vérifié le 11 novembre 2026 : plein écran natif Chromium, jouet sans rotation,
ajustement au viewport, sortie par Échap et bouton. Vue de secours sans API native
vérifiée en mobile simulé, portrait et paysage. Les commandes de page sont masquées.
La fréquence Web Audio observée est 48 000 Hz, identique à la fréquence de sortie
par défaut du MAME compilé ; aucune amélioration audio n’est revendiquée par cet ajout.

## Voix modernes — 11 novembre 2026

- 30 tests automatisés passent, dont le décodage du vocabulaire, la table française
  des lettres, le volume en mode mixte, la fin de parole, l'annulation et le repli.
- Les 142 mots sont décodés depuis la ROM importée ; aucune liste du jeu n'est
  ajoutée aux sources distribuées. Les mots restent absents du texte de la page
  lorsqu'ils sont dictés.
- Chrome installé expose six voix locales françaises ou canadiennes et la voix
  Google français en ligne sur la machine de test. Cette liste dépend de l'appareil.
- Lecture réelle testée avec Microsoft Julie et Microsoft Paul. Une réponse correcte
  a été saisie lettre par lettre avec Julie, puis validée avant le mot suivant.
- Répète, changement de voix, retour à l'original et réinitialisation pendant une
  phrase sont vérifiés. Le gain du moteur est nul pendant les mots modernes.
- L'état TALK est prolongé jusqu'à la fin de la synthèse moderne ; la voix d'origine
  reste disponible pour les annonces non identifiées et pour les sons du jouet.
- L'absence de voix française est simulée et signale clairement l'indisponibilité.
  Les erreurs et le délai maximal de synthèse sont pris en charge par le lecteur.
- Inspection visuelle bureau/mobile simulé : sélecteur et bouton Écouter visibles,
  sans débordement horizontal à 390 px. Aucun nouveau paquet installé.

Le texte des mots du jouet utilise l'alphabet sans accents de la ROM ; la synthèse
du navigateur peut donc différer de la prononciation historique. Le volume choisi
s'applique aux nouvelles annonces. Les annonces qui n'ont pas de correspondance
textuelle gardent leur audio d'origine, comme indiqué près du sélecteur.

## Séparation stricte des modes audio

Correction du 11 novembre 2026 : le mode moderne ne réactive plus le gain du moteur
pour les annonces inconnues, les changements de volume, les erreurs de synthèse ou
la disparition d'une voix. Seul le choix explicite de la voix d'origine rétablit ce
canal. Les consignes de dictée, le succès, le nouvel essai et la correction ont des
phrases modernes ; les annonces encore non identifiées restent silencieuses.

Mesure dans Chrome avec Julie : gain et signal après gain du canal original nuls
pendant la consigne, le mot, une erreur, un nouvel essai et une correction complète.
Ces résultats remplacent le comportement mixte décrit dans la première livraison
des voix modernes. Les 35 tests et le build final sont vérifiés.

## Prononciation de N

Correction du 11 novembre 2026 : le texte vocal de la lettre N est désormais
la lettre majuscule N, au lieu du mot artificiel « enne ». Une comparaison
silencieuse avec Microsoft Hortense Desktop (System.Speech, événements de
phonèmes) produit la même séquence pour N, « ène » et « haine », tandis que
« enne » ajoute des phonèmes. Le test de régression vérifie l'adresse de parole
française de N et le texte transmis. Le reste de l'alphabet reste inchangé.

## Vérification des 26 lettres

Comparaison silencieuse des phonèmes d'Hortense Desktop pour les 26 transcriptions
et les lettres seules. Des différences apparaissent pour C, F, K, Q et W ; N avait
déjà été corrigé. J et « ji » ont la même séquence dans cet essai. Toute la table
moderne utilise désormais les lettres A à Z, avec la langue française de la voix
choisie, sans transcription phonétique manuelle. Un test vérifie les 26 adresses
et les 26 textes. Le correctif concerne la synthèse moderne ; le jeu ROM est conservé.

Contrôle dans Chrome : les 26 lettres ont été parcourues avec Hortense, et C, F,
N avec Julie ; les synthèses atteignent leur événement de fin. La ROM partage
l'adresse sonore de H avec le mot « hache » : cette correspondance est conservée,
avec la même prononciation. Ce contrôle confirme les textes et le fonctionnement
de la synthèse ; il ne constitue pas une écoute comparative de toutes les voix.
Les 37 tests automatisés et le build de production passent.

## ROM mémorisée et démarrage en un clic

Chromium de bureau (1280 × 900), politique autoplay avec geste utilisateur : import
privé, préparation avec gain nul, Marche sur le panneau puis sur le jouet après
rechargement ; contexte audio actif et gain 0,7 après Marche. La ROM est retrouvée
sans sélection de fichier. Seules les requêtes GET du moteur sont observées, sans
téléversement de l'archive. Effacement, deuxième rechargement et import ZIP corrompu
contrôlés. Stockage refusé simulé : la session reste jouable avec explication visible.
Mobile Chromium simulé (390 × 844) : Marche tactile active le jeu et le son, aucun
débordement horizontal. Playwright utilisé car le plugin Browser n'est pas disponible.
Les 37 tests et le build passent. Vérification publique terminée : voir ci-dessous.

Essais complémentaires : refus audio simulé puis activation réussie via Réessayer ;
entrée IndexedDB de type invalide détectée puis effacée. Le build statique servi
sous /dictee-magique/ charge les deux fichiers du moteur et affiche les segments,
sans erreur de console. Une éventuelle 404 de favicon a été supprimée.

## Publication GitHub Pages

https://nairolf76.github.io/dictee-magique/ répond en HTTP 200. Le déploiement
GitHub est terminé avec succès. Import local, gain nul avant Marche puis contexte
audio actif et gain 0,7, Départ, rechargement de ROM mémorisée et effacement ont été
vérifiés sur cette adresse. Un analyseur après gain mesure une crête audio de 0,395
pendant la consigne. Aucune erreur applicative de console ni requête POST n'est
observée. Le parcours tactile est vérifié en Chromium mobile simulé, sans débordement.
Le script de récupération du moteur publié vérifie les deux SHA-256 attendus.
La release v0.1.0 inclut les sources MAME modifiées et les archives sources des ports
liés, sans ROM. Les fichiers distribués sont contrôlés par audit-dist.mjs.

## Félicitations modernes et aide à l’import

Reproduction avec la vraie voix Microsoft Julie : les quatre bonnes réponses
successives déclenchent les adresses 0x80b, 0x872, 0x8c6 et 0x955 de CD2352,
pointées par les entrées 0x5c, 0x5e, 0x60 et 0x62. Seule la première était
associée à un texte moderne ; les trois suivantes restaient silencieuses.
Les quatre entrées sont désormais des félicitations modernes distinctes.
Une nouvelle série de quatre bonnes réponses atteint la fin de chaque synthèse
Julie : Bravo, Bien joué, C’est le bon mot, Très bien. Gain original constamment
nul, aucune erreur de console. Deux tests de régression portent sur les quatre
correspondances et leur passage au lecteur moderne. Les 39 tests passent.

Le catalogue officiel mamedev.org/roms ne contient pas la version française.
L’aide à l’import fournit le modèle snspellfr et un lien externe vers sa fiche
Planet Emulation. Cette fiche indique une archive merged snspell.zip ; le nom
n’est pas un critère de validation. Aucun téléchargement automatique ni fichier
ROM ajouté au site. Contrôle du lien et de l’aide dépliée sur bureau et mobile
Chromium simulé (390 × 844) : aucun débordement ni erreur applicative.


## Cartouches et listes personnelles — 12 novembre 2026

59 tests automatisés passent, dont les anciennes régressions. Le build TypeScript,
les empreintes du moteur et l’audit de distribution passent. Pas de nouvelle
dépendance ; versions et verrou npm conservés.

Les trois fichiers privés ont été identifiés par taille et SHA-1 officiels :

| Cartouche | Mots décodés | Série originale | Répétition | Voix moderne fr-CA |
| --- | ---: | --- | --- | --- |
| motsbase | 132 | 10/10 | Réussie | Mot + répétition terminés, gain MAME nul |
| motsdiff | 212 | 10/10 | Réussie | Mot + répétition terminés, gain MAME nul |
| magasrue | 171 | 10/10 | Réussie | Mot + répétition terminés, gain MAME nul |

Essais réels sur le même moteur MAME WebAssembly publié : chargement natif -cart,
Marche, Module, niveau A, dix réponses correctes continues par cartouche,
félicitations et retour en fin de série. Les adresses émises par MAME correspondent
aux tables vocales à partir de 0x8000. Les annonces et les lettres restent celles
de la ROM principale. Les deux modules plus récents n’exigent pas le bit haut du
premier caractère ; un test synthétique couvre cette différence. Les tests natifs
respectent les pauses de parole entre touches. La synthèse moderne réelle est
Microsoft Caroline fr-CA, avec événements de fin et répétition vérifiés. La qualité
acoustique reste celle de MAME et des voix du système ; pas de traitement audio.

Imports UI ZIP et ROM brute des trois modules validés ; effacer un module laisse
la ROM principale, les autres modules et les listes intacts. Les fichiers privés
et leurs journaux contenant du vocabulaire restent hors du dépôt et du site.

Parcours testés dans Chromium sous Windows, bureau 1440 × 1000 et mobile simulé
390 × 844. Plugin Browser indisponible : Playwright existant utilisé, sans
installation de navigateur ou de dépendances. Vite localhost puis build statique
sous /dictee-magique/. Aucun écran blanc, overlay d’erreur, débordement horizontal
mobile ou erreur applicative de page dans les parcours finaux.

| Vérification | Résultat |
| --- | --- |
| CSV UTF-8, CRLF, virgule/point-virgule, guillemets, contexte, accents | Passée |
| JSON v1, aller-retour, contenus uniquement, doublons signalés | Passée |
| Version inconnue, données invalides, limites 2 Mo/500 entrées | Passée, refus sans ajout partiel |
| Création, modification, duplication, aperçu et export | Passée |
| Migration IndexedDB v1 → v2 avec vraie ROM mémorisée | Passée, ROM conservée |
| Rechargement et suppressions séparées | Passée |
| Stockage refusé | Listes en session, export et exercice utilisables |
| Entraînement clavier | Deux essais, aide, correction, bilan, reprise des erreurs |
| Dictée blanche clavier | Réponses enregistrées sans correction avant le bilan |
| Entraînement / dictée blanche sur papier | Correction au bon moment et auto-évaluation |
| Accents, articles, pluriels, apostrophes et Unicode | Distinctions exigées, tolérances normalisées |
| Vues révision / jouet et plein écran | Séance et réponse conservées, pause/reprise vérifiées |
| Séparation des moteurs | Aucun appui MAME pendant la révision, gain nul puis restauré |
| Voix locale fr-CA puis sélection fr-FR | Vérifiées, choix moderne partagé |
| Absence de voix française et erreur de synthèse | Message clair ; réessai explicite possible |
| Parcours tactile et palette d’accents | Passés, champ complet et clavier natif |
| Modèles publics dans le sous-dossier de déploiement | HTTP 200, données génériques uniquement |

La dictée personnelle ne contient ni apprentissage du cursif ni reconnaissance
manuscrite. Les tests mobiles sont simulés : Safari/iPhone et un appareil physique
restent à vérifier. Les voix disponibles et leur prononciation varient selon le
système. Un navigateur peut effacer IndexedDB : l’export reste la sauvegarde.


## Façade redessinée — 12 novembre 2026

Pictogrammes vectoriels des dix touches de fonction, légendes jaunes, fonctions rouges, lettres orange et voyelles jaunes comparés aux photos Etsy. Le logo français, la main magique, les étoiles et le bloc TI/Speak & Spell sont replacés en bas de la façade, selon une seule variante historique. Aucun fichier photo ni fonte tierce embarqué. La typographie repose sur les fontes système et les contours de marques sont des approximations visuelles, pas des fichiers officiels.

Contrôles Chromium bureau et mobile simulé : quarante touches et leurs noms accessibles conservés, dix pictogrammes SVG, actions de révision et champs complets opérationnels ; plein écran et absence de débordement vérifiés. Les deux SVG sont servis depuis le sous-dossier /dictee-magique/ sans requête de fonte externe.


Publication vérifiée le 12 novembre 2026 (heure locale) : https://nairolf76.github.io/dictee-magique/ ; sources 0272821, build Pages 6ea440f. Déploiement 43347034351 réussi. Les SVG et modèles répondent en HTTP 200. Exercice sans ROM, correction, import privé des six listes scolaires (50 entrées) et rechargement validés sur le site public ; aucune requête POST ni erreur applicative observée.
