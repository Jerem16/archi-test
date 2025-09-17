import {
    userNameSchema,
    initialUserNameForm,
    toUserNameForm,
    toUserNameCreate,
    toUserNameUpdate,
} from "./form";

export const userNameConfig = {
    auth: "owner",
    identifier: "id",
    fields: ["userName"],
    relations: ["comments", "postComments"],
    zodSchema: userNameSchema,
    toForm: toUserNameForm,
    toCreate: toUserNameCreate,
    toUpdate: toUserNameUpdate,
    initialForm: initialUserNameForm,
};
