import { z, type ZodType } from "zod";
import { createModelForm } from "@src/entities/core";
import type {
    UserNameType,
    UserNameFormType,
    UserNameTypeCreateInput,
    UserNameTypeUpdateInput,
} from "./types";

export const {
    zodSchema: userNameSchema,
    initialForm: initialUserNameForm,
    toForm: toUserNameForm,
    toCreate: toUserNameCreate,
    toUpdate: toUserNameUpdate,
} = createModelForm<
    UserNameType,
    UserNameFormType,
    UserNameTypeCreateInput,
    UserNameTypeUpdateInput,
    [string[], string[]]
>({
    zodSchema: z.object({
        userName: z.string(),
        commentsIds: z.array(z.string()),
        postCommentsIds: z.array(z.string()),
    }) as ZodType<UserNameFormType>,
    initialForm: {
        userName: "",
        commentsIds: [],
        postCommentsIds: [],
    },
    toForm: (userName, commentsIds: string[] = [], postCommentsIds: string[] = []) => ({
        userName: userName.userName ?? "",
        commentsIds,
        postCommentsIds,
    }),
    toCreate: (form: UserNameFormType): UserNameTypeCreateInput => {
        const { commentsIds, postCommentsIds, ...values } = form;
        void commentsIds;
        void postCommentsIds;
        return values;
    },
    toUpdate: (form: UserNameFormType): UserNameTypeUpdateInput => {
        const { commentsIds, postCommentsIds, ...values } = form;
        void commentsIds;
        void postCommentsIds;
        return values;
    },
});
