import { tagSchema, initialTagForm, toTagForm, toTagCreate, toTagUpdate } from "./form";

export const tagConfig = {
    auth: "admin",
    identifier: "id",
    fields: ["name"],
    relations: ["posts"],
    zodSchema: tagSchema,
    toForm: toTagForm,
    toCreate: toTagCreate,
    toUpdate: toTagUpdate,
    initialForm: initialTagForm,
};
