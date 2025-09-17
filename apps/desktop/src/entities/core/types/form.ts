// src/entities/core/types/form.ts

import type { EntityConfig } from "@src/entities/core/types/config";

/**
 * Représentation générique d'un formulaire basé sur une configuration d'entité.
 */
export type EntityForm<C extends EntityConfig> = {
    [K in keyof C["fields"]]?: unknown;
};
