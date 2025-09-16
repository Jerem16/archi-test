# Responsabilités du monorepo

Cette page décrit la matrice de scripts par rôle et le CLI `tools/responsibilities.ts` permettant de l'auditer / mettre à jour.

## Runtimes & orchestration
- Node.js **22.19.0** / Yarn **4.9.4** (`node-modules` linker).
- Orchestration racine via `yarn workspaces foreach -Av --exclude root` : `typecheck`, `lint`, `build`, `format` + `test` (après un `vitest run --passWithNoTests`).
- CI GitHub Actions : installe les dépendances (`yarn install --immutable`) puis exécute les 5 jobs ci-dessus.

## CLI `tools/responsibilities.ts`
Lancer avec `yarn tsx tools/responsibilities.ts <commande>` (ou `yarn dlx tsx ...`).

| Commande | Description |
| --- | --- |
| `print` | Affiche, par workspace, les scripts requis/optionnels et leur statut (✅ présent, ❌ manquant, ▫️ optionnel absent). |
| `check` | Retourne un code de sortie `1` si un script obligatoire est manquant. |
| `fix` | Ajoute les scripts manquants sans écraser ceux existants (alias `typecheck` vs `tsc` respecté). |
| `sync` | Garantit la présence des scripts d'orchestration racine. |

Le CLI lit `tools/monorepo-summary.json` (structure machine) et applique la matrice ci-dessous.

## Matrice de scripts par rôle

### `app-next`
- `dev` → `next dev`
- `build` → `next build`
- `start` → `next start`
- `tsc` → `tsc -p tsconfig.json --noEmit`
- `lint` → `eslint .`
- `format` → `prettier --write .`
- `test` → `vitest run --passWithNoTests`
- `analyze` → `NEXT_ANALYZE=1 next build` *(optionnel)*

### `lib-ts`
- `build` → `tsc --build tsconfig.build.json`
- `tsc` → `tsc -p tsconfig.json --noEmit`
- `lint` → `eslint .`
- `format` → `prettier --write .`
- `test` → `vitest run --passWithNoTests`

### `ui-lib`
Identique à `lib-ts` (build TS via `tsc --build` + lint/format/test/tsc).

### `config-pkg`
- `lint` → `eslint .`
- `format` → `prettier --write .`
- `test` → `vitest run --passWithNoTests`
- `tsc` → `tsc -p tsconfig.json --noEmit` *(optionnel, seulement si le package passe en TS)*

## Process recommandé
1. Mettre à jour `tools/monorepo-summary.json` si un workspace/role évolue.
2. Exécuter `yarn tsx tools/responsibilities.ts check` pour valider.
3. Utiliser `fix` au besoin, puis commit + PR.
4. Vérifier que la CI GitHub Actions reste verte.

Références complémentaires : `MONOREPO_SUMMARY.md` (vue d'ensemble) et `MONOREPO_GAPS.md` (suivi des écarts).
