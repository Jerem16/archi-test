import {
    sectionSchema,
    initialSectionForm,
    toSectionForm,
    toSectionCreate,
    toSectionUpdate,
} from "./form";

export const sectionConfig = {
    auth: "admin",
    identifier: "id",
    fields: ["slug", "title", "description", "order", "seo"],
    relations: ["posts"],
    zodSchema: sectionSchema,
    toForm: toSectionForm,
    toCreate: toSectionCreate,
    toUpdate: toSectionUpdate,
    initialForm: initialSectionForm,
};
