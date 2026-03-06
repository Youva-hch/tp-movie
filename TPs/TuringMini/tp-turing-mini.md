# Mini TP — Turing 

## Objectif pédagogique

- Consolider les génériques TypeScript avec `Machine`, `Rule`, `TuringMachine`.
- Comprendre la séparation logique métier orchestration.

## Théorie à retenir

- Le Domain ne doit gérer que la logique de transformation du ruban.
- La validation runtime est donc obligatoire avant d'instancier la machine.
- L'Application orchestre : exécute, gére les erreurs sans interrompre toute la boucle.

## Travail demandé (aligné avec `Apps/src/TuringMini`)

1. Conserver les contrats métier `Machine<T>` et `Rule<T>`.
- `step()` lève une erreur si le ruban est vide.
- `step()` ne fait rien si le pointeur est déjà à la fin.
- Sinon, la valeur courante est transformée, réécrite, puis le pointeur avance.
- `run()` répète jusqu'à la fin.
- `getTape()` renvoie une copie.

3. Dans l'application:
- définir un schéma d'entrée avec `name` non vide et `tape` tableau de nombres non vide,
- définir une règle de transformation numérique (doubler),
- charger + valider + exécuter la machine,
- afficher le résultat,
- en cas d'erreur, afficher le fichier concerné et continuer avec le suivant.

## Résultat attendu

- Un fichier valide est traité et le ruban final est affiché.
- Un fichier invalide (champ manquant, type incorrect, etc.) produit une erreur explicite.
- Le traitement continue sur les autres fichiers.


## Critères d'évaluation

- Noms et comportements alignés avec `TuringMini`.
- Validation runtime effective avant exécution métier.
- Gestion d'erreur claire et robuste par fichier.
- Pilotage par `MACHINE_FILES` opérationnel en environnement Docker Compose.
