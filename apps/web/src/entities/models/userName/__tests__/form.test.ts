import { describe, it, expect } from "vitest";
import { faker } from "@faker-js/faker";
import {
    toUserNameForm,
    toUserNameCreate,
    toUserNameUpdate,
} from "@src/entities/models/userName/form";
import type { UserNameType, UserNameFormType } from "@src/entities/models/userName/types";

describe("toUserNameForm", () => {
    it("convertit UserNameType en UserNameFormType", () => {
        const userName = {
            userName: faker.internet.username(),
        } as unknown as UserNameType;

        const commentsIds = [faker.string.uuid()];
        const postCommentsIds = [faker.string.uuid()];
        const form = toUserNameForm(userName, commentsIds, postCommentsIds);
        expect(form).toEqual({
            userName: userName.userName,
            commentsIds,
            postCommentsIds,
        });
    });
});

describe("toUserNameCreate / toUserNameUpdate", () => {
    it("supprime commentsIds et postCommentsIds", () => {
        const form: UserNameFormType = {
            userName: faker.internet.username(),
            commentsIds: [faker.string.uuid()],
            postCommentsIds: [faker.string.uuid()],
        };

        const expected = { userName: form.userName };
        expect(toUserNameCreate(form)).toEqual(expected);
        expect(toUserNameUpdate(form)).toEqual(expected);
    });
});
