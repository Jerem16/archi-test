# Types génériques des modèles Amplify

Ce dossier expose plusieurs utilitaires pour manipuler les types générés par Amplify.

## BaseModel

Décrit la forme brute d'un modèle issu du `Schema`. Il correspond directement à la structure renvoyée par Amplify pour le modèle indiqué.

## CreateOmit

Version utilitaire de `BaseModel` dédiée à la création : les propriétés générées automatiquement (`id`, `createdAt`, `updatedAt`) sont omises. C'est la base pour construire des objets envoyés aux mutations `create`.

## UpdateInput

Type partiel dérivé de `CreateOmit`. Chaque champ est optionnel afin de représenter la charge utile d'une mutation `update`.

## ModelForm

Générique puissant destiné aux formulaires. Il part de `CreateOmit` et permet :

- d'exclure certains champs (`O`),
- de convertir des relations en listes d'identifiants (`R` ⇒ `${R}Ids`),
- d'injecter des types personnalisés (`CTMap`) et de choisir ceux à substituer (`CT`).

### Exemple

```ts
import type { ModelForm } from "@src/entities/core";

type PostForm = ModelForm<
    "Post",
    never,
    "tags",
    { seo: { title: string; description: string; image: string } },
    "seo"
>;
```

Dans cet exemple :

- le modèle Amplify `Post` est transformé en type de formulaire ;
- le champ relationnel `tags` devient `tagsIds: string[]` ;
- le type personnalisé `Seo` est remplacé par un objet simple adapté au formulaire.
