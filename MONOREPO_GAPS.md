# Monorepo — Gaps

## Résolus
- Alignement Node engines sur `>=22.19.0 <23` au niveau racine.
- Scripts workspaces normalisés par rôle (lint/format/test/tsc/build) et ajout des scripts manquants.
- Orchestration racine via `yarn workspaces foreach -Av --exclude root` + synchronisation par le CLI `tools/responsibilities.ts`.
- Mise en place de la baseline Vitest (`vitest.config.ts` + `tests/smoke.test.ts`).
- Ajout de la CI GitHub Actions (typecheck → lint → build → test) et documentation associée.

## Restants
- Aucun écart identifié à date — surveiller l'évolution des besoins produits/outillage.
