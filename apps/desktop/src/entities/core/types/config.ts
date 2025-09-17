// src/entities/core/types/config.ts

/**
 * Règles d'authentification appliquées à une entité.
 */
export type AuthRule =
    | { allow: "owner"; ownerField?: string }
    | { allow: "groups"; groups: string[] }
    | { allow: "public" }
    | { allow: "private" };

/**
 * Nature d'un champ au sein d'une entité.
 */
export type FieldKind = "scalar" | "relation" | "identifier";

interface BaseField {
    type: string;
    required?: boolean;
    isArray?: boolean;
}

export interface FieldDef extends BaseField {
    kind: "scalar";
}

export interface RelationDef extends BaseField {
    kind: "relation";
    target: string;
    many?: boolean;
}

export interface IdentifierDef extends BaseField {
    kind: "identifier";
    strategy?: "auto" | "uuid";
}

export type EntityFields = Record<string, FieldDef | RelationDef | IdentifierDef>;

export interface EntityConfig {
    name: string;
    fields: EntityFields;
    auth?: AuthRule[];
}
