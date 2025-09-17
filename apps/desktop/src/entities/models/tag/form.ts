import { z, type ZodType } from "zod";
import { createModelForm } from "@src/entities/core";
import {
    type TagType,
    type TagFormType,
    type TagTypeUpdateInput,
} from "@src/entities/models/tag/types";

export const {
    zodSchema: tagSchema,
    initialForm: initialTagForm,
    toForm: toTagForm,
    toCreate: toTagCreate,
    toUpdate: toTagUpdate,
} = createModelForm<TagType, TagFormType, TagTypeUpdateInput, TagTypeUpdateInput, [string[]]>({
    zodSchema: z.object({
        name: z.string(),
        postIds: z.array(z.string()),
    }) as ZodType<TagFormType>,
    initialForm: {
        name: "",
        postIds: [],
    },
    toForm: (tag, postIds: string[] = []) => ({
        name: tag.name ?? "",
        postIds,
    }),
    toCreate: (form: TagFormType): TagTypeUpdateInput => {
        const { postIds, ...values } = form;
        void postIds;
        return values;
    },
    toUpdate: (form: TagFormType): TagTypeUpdateInput => {
        const { postIds, ...values } = form;
        void postIds;
        return values;
    },
});
