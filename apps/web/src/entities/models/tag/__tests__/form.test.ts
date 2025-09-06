import { describe, it, expect } from "vitest";
import { faker } from "@faker-js/faker";
import { toTagForm, toTagCreate, toTagUpdate } from "@src/entities/models/tag/form";
import type { TagType, TagFormType } from "@src/entities/models/tag/types";

describe("toTagForm", () => {
    it("convertit TagType en TagFormType", () => {
        const tag = {
            name: faker.word.words(1),
        } as unknown as TagType;

        const postIds = [faker.string.uuid(), faker.string.uuid()];
        const form = toTagForm(tag, postIds);
        expect(form).toEqual({ name: tag.name, postIds });
    });
});

describe("toTagCreate / toTagUpdate", () => {
    it("supprime postIds", () => {
        const form: TagFormType = {
            name: faker.word.words(1),
            postIds: [faker.string.uuid()],
        };

        const expected = { name: form.name };
        expect(toTagCreate(form)).toEqual(expected);
        expect(toTagUpdate(form)).toEqual(expected);
    });
});
