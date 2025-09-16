# Outillage custom

| Script | Description | Commande |
| --- | --- | --- |
| `tools:css-prune` | Lancement du scanner CSS (`tools/css-prune.ts`) qui merge les safelists puis génère rapports. | `yarn tools:css-prune [--apply|--debug|...]` |
| `css:prune:apply` | Variante historique qui applique directement les corrections après analyse. | `yarn css:prune:apply` |
| `tools:sitemap` | Génère `public/sitemap.xml` via `tools/scripts/generate-sitemap.js`. | `yarn tools:sitemap` |
| `keep:list` | Met à jour `keep-list.cjs` (liste de classes CSS à conserver). | `yarn keep:list` |
| `keep:fn` | Exécute `keep-functions.cjs` (safelists dynamiques). | `yarn keep:fn` |
| `keep` | Chaîne lint + safelists (`keep-list.cjs` + `keep-functions.cjs`). | `yarn keep` |

Les scripts réutilisables se trouvent dans `tools/scripts/lib/`. `css-prune.ts` expose notamment des helpers pour fusionner les safelists et générer des rapports Markdown/JSON.

> Astuce : l'ensemble des scripts utilise Node 22.19.0 et suppose une installation via `yarn install --immutable`.
