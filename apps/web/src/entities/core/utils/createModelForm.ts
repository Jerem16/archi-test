// src/entities/core/utils/createModelForm.ts

/**
 * Génère un objet regroupant toutes les fonctions nécessaires à la
 * manipulation d'un formulaire basé sur un modèle spécifique.
 */
import type { ZodType } from "zod";

export function createModelForm<M, F, C, U, A extends unknown[] = unknown[]>({
    zodSchema,
    initialForm,
    toForm,
    toCreate,
    toUpdate,
}: {
    zodSchema: ZodType<F>;
    initialForm: F;
    toForm: (model: M, ...args: A) => F;
    toCreate: (form: F) => C;
    toUpdate: (form: F) => U;
}) {
    return {
        zodSchema,
        initialForm,
        toForm,
        toCreate,
        toUpdate,
    } as const;
}
