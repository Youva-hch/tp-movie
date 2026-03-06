# TP Cart

Utilisez le `starter`

## Contexte

Vous construisez un mini 'panier' qui permet de :
- ajouter des produits (ex: films) avec une quantité
- calculer le total (TVA incluse)
- persister le panier (au choix : en mémoire ou PostgreSQL)

## Prérequis

- Node.js
- Docker + Docker Compose (recommandé pour PostgreSQL)
- VS Code (recommandé)

## Organisation attendue (comme `Cart`)

Créez un dossier `Cart/` (dans votre projet) avec :

- `Application/` : point d'entrée (script de démo)
- `Domain/` : logique métier (Cart + Movie)
- `Infrastructure/` : DB + persistance
- `schema.sql` : création de table
- `types.ts` : interfaces partagées
- `.env`  : configuration locale

##  Définir les contrats (`types.ts`)

Vous devez définir des interfaces (pas de `any`) :

1) Storage synchrone (mémoire) :
- `setValue(key, value): void`
- `restore(key): void`
- `reset(): void`
- `getStorage(): Record<string, number>`

2) Storage asynchrone (DB) :
- mêmes opérations mais en `Promise<...>`

3) Produit :
- `getName(): string`
- `getPrice(): number`

Contraintes :
- une seule définition de `Productable` (éviter les doublons/merging involontaire)
- `strict: true` doit passer

## Domaine : `Movie`

Créer `Domain/Movie.ts` :
- une classe `Movie` qui implémente `Productable`
- champs privés (`name`, `price`)
- getters (et setters si vous le souhaitez)

Objectif : utiliser les classes TS comme modèle métier.

## Infrastructure : storage en mémoire

Créer `Infrastructure/ArrayStorage.ts` :
- une classe `StorageArray` qui implémente votre interface synchrone
- comportement attendu :
  - si `setValue("Twin Peaks", 10)` est appelé plusieurs fois, les valeurs s'additionnent
  - `restore(name)` supprime l'entrée si elle existe
  - `reset()` vide tout
  - n'ajoutez pas de méthode `total()` au storage (ou alors via une interface séparée) : le total est une responsabilité 'métier'.

## Domaine : `Cart`

Créer `Domain/Cart.ts` :
- une classe `Cart` qui reçoit un storage en dépendance (**injection**)
- une TVA par défaut (ex: `0.2`)

Méthodes attendues (version async, pour être compatible DB) :
- `buy(product, quantity): Promise<void>`
- `reset(): Promise<void>`
- `restore(product): Promise<void>`
- `total(): Promise<number>`

Règles métier (minimum) :
- `quantity` doit être > 0 (sinon erreur)
- calcul : `totalItem = quantity * price * (1 + tva)`

Objectif : `Cart` ne sait **pas** si l'on stocke en mémoire ou en base de données.

## Application : script de démonstration

Créer `Application/index.ts` :
- instancier un storage (d'abord `StorageArray`)
- instancier un `Cart(storage)`
- exécuter un scénario :
  - reset
  - acheter un film de votre choix quantité 2
  - afficher `total()`
  - acheter encore le même film
  - acheter un autre film
  - afficher `total()` à chaque étape

## PostgreSQL : table + Docker

Créer `schema.sql` :

```sql
CREATE TABLE cart_storage (
  name TEXT PRIMARY KEY,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0)
);
```

Si vous utilisez Docker (comme `starter/docker-compose.yml`) :
- un service `postgres` (DB `db`, user `postgres`, pass `postgres`)
- un service `app` qui reçoit les variables d'environnement DB

Commandes utiles (exemples) :
- `docker compose up --build`
- `docker exec -it cart-postgres psql -U postgres -d db`
- coller le SQL de `schema.sql`

##  Infrastructure : connexion DB (`DB.ts`)

Créer `Infrastructure/DB.ts` :
- exporter un `Pool` `pg`
- lire la config via variables d'environnement :
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

Important :
- si vous souhaitez utiliser un `.env` local, ajoutez `dotenv` dans votre entrypoint (ex: `import "dotenv/config"`).

## Infrastructure : storage Postgres (`PgStorage.ts`)

Créer `Infrastructure/PgStorage.ts` qui implémente le storage async.

Comportement attendu (mêmes effets que le storage mémoire) :
- `setValue(name, price)` :
  - insert si absent
  - sinon additionner au prix existant
- `restore(name)` : delete
- `reset()` : vider la table
- `getStorage()` : retourner `{ [name]: price }`

##  Switch mémoire ↔ Postgres

Objectif : pouvoir choisir l'implémentation sans modifier le domaine.

Deux options :
- (simple) changer l'instanciation dans `Application/index.ts`
- (mieux) une variable `STORAGE=memory|pg` et une petite factory

## Livrables

- Le dossier `Cart/` complet (comme décrit)
- Un `Application/index.ts` qui tourne en mémoire
- Une version qui tourne avec PostgreSQL (Docker)
