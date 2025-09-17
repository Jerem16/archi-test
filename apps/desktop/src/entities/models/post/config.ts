import { postSchema, initialPostForm, toPostForm, toPostCreate, toPostUpdate } from "./form";

export const postConfig = {
    auth: "admin",
    identifier: "id",
    fields: [
        "slug",
        "title",
        "excerpt",
        "content",
        "videoUrl",
        "authorId",
        "order",
        "type",
        "status",
        "seo",
    ],
    relations: ["author", "tags", "sections", "comments"],
    zodSchema: postSchema,
    toForm: toPostForm,
    toCreate: toPostCreate,
    toUpdate: toPostUpdate,
    initialForm: initialPostForm,
};
