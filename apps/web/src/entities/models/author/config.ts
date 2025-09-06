import {
    authorSchema,
    initialAuthorForm,
    toAuthorForm,
    toAuthorCreate,
    toAuthorUpdate,
} from "./form";

export const authorConfig = {
    auth: "admin",
    identifier: "id",
    fields: ["authorName", "bio", "email", "avatar", "order"],
    relations: ["posts"],
    zodSchema: authorSchema,
    toForm: toAuthorForm,
    toCreate: toAuthorCreate,
    toUpdate: toAuthorUpdate,
    initialForm: initialAuthorForm,
};
