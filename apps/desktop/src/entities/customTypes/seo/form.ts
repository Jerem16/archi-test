import { z, type ZodType } from "zod";
import type { SeoType, SeoFormType, SeoTypeUpdateInput } from "./types";
import { createModelForm } from "@src/entities/core";

// 1) On génère via createModelForm
const seoCMF = createModelForm<SeoType, SeoFormType, SeoTypeUpdateInput, SeoTypeUpdateInput>({
    zodSchema: z.object({
        title: z.string(),
        description: z.string(),
        // IMPORTANT : comme avant, image est optionnel
        image: z.string().optional(),
    }) as ZodType<SeoFormType>,

    initialForm: {
        title: "",
        description: "",
        image: "",
    },

    // NB: createModelForm attend ici (model: SeoType) => SeoFormType
    // On laisse la version "strict" en interne, et on expose un wrapper nullable juste après.
    toForm: (seo: SeoType) => ({
        title: seo?.title ?? "",
        description: seo?.description ?? "",
        image: seo?.image ?? "",
    }),

    toCreate: (form: SeoFormType): SeoTypeUpdateInput => ({ ...form }),
    toUpdate: (form: SeoFormType): SeoTypeUpdateInput => ({ ...form }),
});

// On exporte le schéma, l'initial, create/update
export const {
    zodSchema: seoSchema,
    initialForm: initialSeoForm,
    toCreate: toSeoCreate,
    toUpdate: toSeoUpdate,
} = seoCMF;

// 2) Wrapper nullable COMPATIBLE avec ton appel existant: toSeoForm(post.seo)
const { toForm: toSeoFormStrict } = seoCMF;

/** Version "safe" qui accepte null/undefined comme avant */
export const toSeoForm = (seo: SeoType | null | undefined): SeoFormType =>
    toSeoFormStrict(seo ?? ({} as SeoType));
