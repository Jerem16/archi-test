// src/entities/core/types/model.ts

import type { EntityConfig } from "@src/entities/core/types/config";

/**
 * Modèle typé dérivé d'une configuration d'entité.
 */
export type EntityModel<C extends EntityConfig> = {
    [K in keyof C["fields"]]: unknown;
};
