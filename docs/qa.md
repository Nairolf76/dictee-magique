# Vérification fonctionnelle et visuelle

## Critères

| Comportement | Contrôle attendu |
| --- | --- |
| Import local | ZIP valide accepté ; mauvais modèle, corruption et fichier tronqué refusés ; aucun POST réseau |
| Démarrage français | ROM snspellfr exécutée ; segments réels modifiés ; audio non silencieux |
| Dictée | Niveau A choisi, Départ, réponses, Essaie, bilan après la série |
| Répète | Rediffusion de la consigne sans progression de la partie |
| Autres modes | Mot mystère, Code secret, Lettre et Dis-le répondent aux commandes |
| Marche / Arrêt | Extinction puis retour par Épelle/Marche |
| Réinitialisation | Touches relâchées, machine réinitialisée sans rechargement de ROM |
| Entrées | Souris, clavier et tactile ; répétition clavier ; annulation tactile ; perte de focus |
| Audio | Activation explicite et volume ; aucun service de synthèse vocale externe |
| Présentation | Comparaison avec référence française ; desktop 1280 px et mobile 390 px sans débordement |
| Publication | Build statique complet, notices, aucun fichier ROM ou média tiers dans dist |

Les tests automatisés sans ROM utilisent exclusivement des données synthétiques.
Les tests d'intégration avec ROM privée sont séparés de la distribution.
Ne cocher un contrôle manuel que lorsqu'il a été observé.
