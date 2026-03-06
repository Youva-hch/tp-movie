# Mini TP — "TuringMini + frontière Zod" (version web/dev)

Ce mini TP garde la mécanique de **TuringMini** (mêmes noms de contrats/classes), avec une difficulté en plus :
- la donnée de départ vient d'un **JSON externe**
- donc il faut valider la frontière avec `zod`

Objectif : pratiquer TypeScript (génériques + architecture) et la validation runtime.

## Préparation 

Mise en place des variables d'environnements, arrêter les conteneurs modifier les variables d'environnement dans le docker compose (bonne pratique quand on a Docker), puis redémarrer simplement vos conteneurs.

```bash
docker compose down
docker compose up -d
```
## Contraintes (importantes)

- Architecture : `Domain / Infrastructure / Application`.
- Le **Domain** ne dépend d'aucune API externe (`fs`, HTTP, DB, etc.).
- `strict: true` doit passer.
- Interdits : `any`.
- Les méthodes publiques doivent avoir des contrats explicites.
- La frontière JSON doit passer par `unknown` + `zod`.

## Théorie (ultra courte)

TypeScript protège au compile-time.
Les données externes arrivent au runtime.

> Donc : validation runtime à la frontière, logique pure dans le Domain.

## Emplacement

Travaillez dans `TPs/PipelineMini/` avec l'arborescence :

- `Domain/`
  - `types.ts`
  - `TuringMachine.ts`
- `Infrastructure/`
  - `loadMachineInput.ts`
- `Application/`
  - `index.ts`
- `inputs/`
  - `valid-numbers.json`
  - `invalid-missing-tape.json`
  - `invalid-wrong-tape-type.json`

## Travail demandé

## 1) Domain : contrats (`Domain/types.ts`)

Définissez :

- `Machine<T>` :
  - `step(): void`
  - `run(): void`
  - `getTape(): T[]`
- `Rule<T>` :
  - `transform(value: T): T`

## 2) Domain : implémentation (`Domain/TuringMachine.ts`)

Créez `TuringMachine<T>` qui implémente `Machine<T>`.

Constructeur attendu :
- `tape: T[]`
- `rule: Rule<T>`
- `pointer` optionnel (défaut `0`)

Règles :
- `step()` :
  - si ruban vide -> lève une erreur
  - si `pointer` est à la fin -> ne fait rien
  - sinon : transforme la valeur courante puis avance le pointeur
- `run()` : boucle jusqu'à la fin du ruban
- `getTape()` : retourne une copie du ruban

## 3) Infrastructure : validation frontière (`Infrastructure/loadMachineInput.ts`)

Implémentez :

- `loadMachineInput(path: string): Promise<LoadResult<number>>`

avec :
- lecture de fichier (`fs/promises`)
- `JSON.parse` -> `unknown`
- validation `zod`

Shape JSON attendu :
- `name: string` (min 1)
- `tape: number[]` (au moins 1 élément)

Résultat typé (union discriminée) :
- succès : `{ ok: true, value: { name: string; tape: number[] } }`
- erreur : `{ ok: false, error: { code: "INVALID_JSON" | "INVALID_SHAPE"; message: string } }`

## 4) Application : scénario (`Application/index.ts`)

1. charge `inputs/valid-numbers.json`
2. si erreur : afficher et arrêter
3. sinon créer une règle `number` (`n => n * 2`)
4. exécuter la machine
5. afficher `name`, ruban avant/après

Puis charger les 2 JSON invalides et afficher le code d'erreur.

## Cas attendus

- `valid-numbers.json` -> succès
- `invalid-missing-tape.json` -> `INVALID_SHAPE`
- `invalid-wrong-tape-type.json` -> `INVALID_SHAPE`

## Bonus

Ajouter un second chargeur validé `zod` pour `tape: string[]`.

## Livrables

- Structure respectée
- Noms alignés avec `TuringMini` (`Machine`, `Rule`, `TuringMachine`)
- Validation frontière correcte (`unknown` + `zod`)
- `strict: true`, sans `any`
