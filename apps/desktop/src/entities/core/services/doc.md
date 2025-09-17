# Services de base Amplify

## Configuration `amplifyClient`

Le fichier `amplifyClient.ts` configure Amplify avec les sorties générées par `amplify pull` et crée un client typé :

```ts
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import outputs from "@/amplify_outputs.json";
import type { Schema } from "@/amplify/data/resource";

Amplify.configure(outputs);
export const client = generateClient<Schema>();
```

Cette configuration permet de générer un client fortement typé (`Schema`) pour accéder aux modèles et opérations GraphQL.

## `crudService`

`crudService` fournit des opérations CRUD génériques pour n'importe quel modèle défini dans `client.models`.

```ts
import { crudService } from "@src/entities/core/services";

const posts = crudService("Post");
await posts.create({ title: "Hello" });
const { data } = await posts.list();
```

## `relationService`

`relationService` facilite la gestion des tables de relation (many-to-many).

```ts
import { relationService } from "@src/entities/core/services";

const postsTags = relationService("PostsTags", "postId", "tagId");
await postsTags.create("post-1", "tag-1");
const tagIds = await postsTags.listByParent("post-1");
```

Chaque service expose des méthodes `create`, `delete` et `list` adaptées aux relations spécifiées.
