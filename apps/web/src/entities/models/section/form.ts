import { z, type ZodType } from "zod";
import {
    type SectionType,
    type SectionFormType,
    type SectionTypeUpdateInput,
} from "@src/entities/models/section/types";
import { toSeoForm, initialSeoForm, seoSchema } from "@src/entities/customTypes/seo";
import type { SeoType } from "@src/entities/customTypes/seo";
import { createModelForm } from "@src/entities/core";

export const {
    zodSchema: sectionSchema,
    initialForm: initialSectionForm,
    toForm: toSectionForm,
    toCreate: toSectionCreate,
    toUpdate: toSectionUpdate,
} = createModelForm<
    SectionType,
    SectionFormType,
    SectionTypeUpdateInput,
    SectionTypeUpdateInput,
    [string[]]
>({
    zodSchema: z.object({
        slug: z.string(),
        title: z.string(),
        description: z.string(),
        order: z.number(),
        seo: seoSchema,
        postIds: z.array(z.string()),
    }) as ZodType<SectionFormType>,
    initialForm: {
        slug: "",
        title: "",
        description: "",
        order: 1,
        seo: { ...initialSeoForm },
        postIds: [],
    },
    toForm: (section, postIds: string[] = []) => ({
        slug: section.slug ?? "",
        title: section.title ?? "",
        description: section.description ?? "",
        order: section.order ?? 1,
        seo: toSeoForm((section.seo ?? {}) as SeoType),
        postIds,
    }),
    toCreate: (form: SectionFormType): SectionTypeUpdateInput => {
        const { postIds, ...values } = form;
        void postIds;
        return values;
    },
    toUpdate: (form: SectionFormType): SectionTypeUpdateInput => {
        const { postIds, ...values } = form;
        void postIds;
        return values;
    },
});
