# Next 15 Monorepo (apps/packages)

Monorepo minimal conforme à:

- **Next.js** `15.0.3`
- **react-markdown** `10.1.0` + **remark-gfm**
- **Sass** `1.60.0`
- **AWS Amplify** `aws-amplify@6.9.0` + `@aws-amplify/ui-react`
- **Workspaces Yarn 4**
- **TypeScript** `5.4.4`

## Démarrage rapide

```bash
# À la racine
yarn
yarn dev        # lance apps/web
```

## Structure

- `apps/web` : App Next.js 15
- `packages/ui` : Composants UI (React, SCSS)
- `packages/domain` : Logique métier (pure TS)
- `packages/services` : IO/Orchestration (Amplify, REST, etc.)
- `packages/types` : Types/contrats partagés
- `tools` : Configs/outillage
- `docs` : Documentation
- `tests` : Dossiers de tests (selon besoin)

## Aliases TypeScript

- `@packages/ui/*`
- `@packages/domain/*`
- `@packages/services/*`
- `@packages/types/*`
