# Module core

Le module `core` rassemble les outils de base pour manipuler les entités de l'application. Il expose un point d'entrée unique et organise les responsabilités en couches pour simplifier la maintenance.

## Index

Le fichier [`index.ts`](./index.ts) ré-exporte les contenus des sous-dossiers `services`, `hooks`, `utils` et `types`. Cela permet d'importer toutes les fonctionnalités du module depuis `@src/entities/core` sans connaître la structure interne.

## Rôle des sous-dossiers

- **types** : définit les types génériques et les structures communes utilisées par les autres couches.
- **utils** : propose des fonctions utilitaires basées sur ces types afin de transformer ou préparer les données.
- **services** : implémente la logique métier et les appels à l'API en s'appuyant sur les utilitaires.
- **hooks** : fournit des hooks React qui consomment les services pour les exposer facilement aux composants.

## Étapes typiques

```text
types → utils → services → hooks
```

1. Déclarer les **types** de données.
2. Créer les **utils** pour manipuler ces types.
3. Développer les **services** qui exploitent les utils.
4. Exposer le tout via des **hooks** destinés aux composants.
