# Architecture

- **apps/web**: Next.js 15 (App Router)
- **packages/ui**: composants React (aucun IO)
- **packages/domain**: logique métier pure (aucun React ni IO)
- **packages/services**: accès données + orchestrations (Amplify, REST, etc.)
- **packages/types**: types et interfaces partagés

## Flux de dépendances
```
apps/web -> ui, domain, services, types
services -> domain?, types
domain -> types
ui -> domain?, types (pas de services)
```
