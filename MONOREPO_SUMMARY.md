# Monorepo — Résumé Express

- **Runtime** : Node.js 22.19.0, Yarn 4.9.4 (`node-modules` linker).
- **CI** : GitHub Actions (pipeline typecheck → lint → build → test).
- **Workspaces** :
  - `apps/web` — Application Next.js (15) principale.
  - `packages/domain` — Modèle métier partagé (TypeScript).
  - `packages/services` — Services orientés intégrations Amplify/Next.
  - `packages/types` — Types transverses.
  - `packages/ui` — Bibliothèque UI React/TypeScript.
  - `packages/eslint-config` — Configuration ESLint partagée.
- **Outillage** : scripts normalisés par rôle (dev/build/tsc/lint/format/test) + CLI `tools/responsibilities.ts` pour auditer/mettre à jour.
- **Qualité** : baseline Vitest (`tests/smoke.test.ts`) et orchestration `yarn workspaces foreach -Av --exclude root` pour typecheck/lint/build/test/format.

Consulte `docs/monorepo-responsibilities.md` pour la matrice complète et `docs/tools.md` pour l'inventaire des utilitaires.
