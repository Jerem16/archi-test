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
yarn dev:desktop   # lance l'app desktop (http://localhost:3000)
yarn dev:mobile    # lance l'app mobile  (http://localhost:3001)
```

## Structure

- `apps/desktop` : App Next.js 15 bureau
- `apps/mobile` : App Next.js 15 mobile
- `packages/ui` : Composants UI (React, SCSS)
- `packages/domain` : Logique métier (pure TS)
- `packages/services` : IO/Orchestration (Amplify, REST, etc.)
- `packages/types` : Types/contrats partagés
- `tools` : Configs/outillage
- `docs` : Documentation
- `tests` : Dossiers de tests (selon besoin)

## Variables d'environnement

Chaque application possède un fichier `.env.local.example`. Copie-le vers `.env.local` et ajuste les hôtes :

| Variable | Description |
| --- | --- |
| `HOST_MOBILE` / `HOST_DESKTOP` | Hôtes utilisés côté middleware Edge. |
| `NEXT_PUBLIC_HOST_MOBILE` / `NEXT_PUBLIC_HOST_DESKTOP` | Hôtes exposés au client pour la resynchronisation post-hydratation. |
| `NEXT_PUBLIC_PLATFORM_THRESHOLD` | Seuil de bascule responsive (en pixels, défaut `900`). |

En production, configure les domaines finaux (ex. `mobile.peur-de-la-conduite.fr`).

## Routing responsive

- **Serveur** : middleware Edge (`apps/*/middleware.ts`) qui redirige selon le User-Agent.
- **Client** : composant `RouteSync` injecté dans chaque layout qui compare le viewport (`window.innerWidth`) au seuil défini et bascule vers l'hôte adapté en conservant `pathname`, `query` et `hash`.
- **Anti-boucle** : la redirection ne s'exécute que si l'hôte courant diffère de l'hôte attendu.

## Aliases TypeScript

- `@packages/ui/*`
- `@packages/domain/*`
- `@packages/services/*`
- `@packages/types/*`
- `@app/*` → `apps/{desktop|mobile}/app/*`
- `@src/*` → `apps/{desktop|mobile}/src/*`
