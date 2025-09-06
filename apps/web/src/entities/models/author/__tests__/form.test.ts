import { describe, it, expect } from "vitest";
import { faker } from "@faker-js/faker";
import { toAuthorForm, toAuthorCreate, toAuthorUpdate } from "@src/entities/models/author/form";
import type { AuthorType, AuthorFormType } from "@src/entities/models/author/types";

describe("toAuthorForm", () => {
    it("convertit AuthorType en AuthorFormType", () => {
        const author = {
            authorName: faker.person.fullName(),
            avatar: faker.image.avatar(),
            bio: faker.lorem.sentence(),
            email: faker.internet.email(),
            order: faker.number.int(),
        } as unknown as AuthorType;

        const postIds = [faker.string.uuid(), faker.string.uuid()];
        const form = toAuthorForm(author, postIds);
        expect(form).toEqual({
            authorName: author.authorName,
            avatar: author.avatar,
            bio: author.bio,
            order: author.order,
            email: author.email,
            postIds,
        });
    });
});

describe("toAuthorCreate / toAuthorUpdate", () => {
    it("supprime postIds", () => {
        const form: AuthorFormType = {
            authorName: faker.person.fullName(),
            avatar: faker.image.avatar(),
            bio: faker.lorem.sentence(),
            email: faker.internet.email(),
            order: faker.number.int(),
            postIds: [faker.string.uuid()],
        };

        const expected = {
            authorName: form.authorName,
            avatar: form.avatar,
            bio: form.bio,
            order: form.order,
            email: form.email,
        };

        expect(toAuthorCreate(form)).toEqual(expected);
        expect(toAuthorUpdate(form)).toEqual(expected);
    });
});
