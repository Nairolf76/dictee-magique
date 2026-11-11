# Publication sur GitHub Pages

Le site est statique, sans serveur applicatif ni télémétrie. GitHub Pages est
gratuit pour ce dépôt public ; la plateforme GitHub n'est pas libre. Le code
applicatif reste sous MIT et le moteur conserve ses licences. Aucun lien à Codeberg
n'est nécessaire : cette plateforme exclut les projets majoritairement générés par IA.

Le visiteur importe sa ROM une seule fois par navigateur et par adresse du site.
IndexedDB conserve uniquement l'archive française normalisée. Elle est revérifiée
à chaque chargement. Effacer ma ROM mémorisée la supprime et recharge la page.
Le navigateur peut évincer ses données ou les supprimer en fin de navigation privée.
Le passage du site local au site public nécessite un nouvel import.

Le moteur se prépare en silence ; Marche (sur le jouet ou dans les commandes)
active le son à partir d'un geste utilisateur. Un refus audio reste visible et
permet de réessayer. Aucun contournement de la politique du navigateur.

## Construire et publier

1. Construire le moteur ou récupérer le moteur publié, puis npm ci, npm test et npm run build.
2. Conserver les sources applicatives, scripts et notices sur la branche principale.
3. Publier le contenu de dist dans gh-pages, avec .nojekyll à la racine.
4. Dans Settings → Pages, choisir Deploy from a branch, gh-pages et / (root).
5. Vérifier https://nairolf76.github.io/dictee-magique/ après le déploiement.

Les chemins sont relatifs : le moteur et les ressources fonctionnent sous le
sous-dossier du dépôt. Ne jamais publier la ROM privée, de photos tierces ou de sons
extraits. Le build contrôle les empreintes du moteur et l'absence de ROM dans dist.
Le moteur est accompagné dans les Releases des sources MAME modifiées et des
sources des ports liés ; le pont et les commandes de compilation restent dans le dépôt.
Les binaires moteur sont exclus de la branche source, mais présents dans gh-pages.

## Contrôle après publication

- Import initial, Marche, rechargement sans réimport et effacement.
- Chargement de engine/dictee.js et engine/dictee.wasm sous le chemin du dépôt.
- Notices accessibles ; aucun envoi de ROM sur le réseau.
- Ordinateur et mobile Chromium simulé ; autres navigateurs à vérifier séparément.

Documentation officielle :
https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
