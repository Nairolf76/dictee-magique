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
Les 37 tests et le build passent. Vérification publique à compléter après publication.

Essais complémentaires : refus audio simulé puis activation réussie via Réessayer ;
entrée IndexedDB de type invalide détectée puis effacée. Le build statique servi
sous /dictee-magique/ charge les deux fichiers du moteur et affiche les segments,
sans erreur de console. Une éventuelle 404 de favicon a été supprimée.
