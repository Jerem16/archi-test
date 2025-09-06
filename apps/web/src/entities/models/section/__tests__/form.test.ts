import { describe, it, expect } from "vitest";
import { faker } from "@faker-js/faker";
import { toSectionForm, toSectionCreate, toSectionUpdate } from "@src/entities/models/section/form";
import type { SectionType, SectionFormType } from "@src/entities/models/section/types";

describe("toSectionForm", () => {
    it("convertit SectionType en SectionFormType", () => {
        const section = {
            slug: faker.lorem.slug(),
            title: faker.lorem.words(3),
            description: faker.lorem.sentence(),
            order: faker.number.int(),
            seo: {
                title: faker.lorem.words(2),
                description: faker.lorem.sentence(),
                image: faker.image.url(),
            },
        } as unknown as SectionType;

        const postIds = [faker.string.uuid(), faker.string.uuid()];
        const form = toSectionForm(section, postIds);
        expect(form).toEqual({
            slug: section.slug,
            title: section.title,
            description: section.description,
            order: section.order,
            seo: section.seo,
            postIds,
        });
    });
});

describe("toSectionCreate / toSectionUpdate", () => {
    it("supprime postIds", () => {
        const form: SectionFormType = {
            slug: faker.lorem.slug(),
            title: faker.lorem.words(3),
            description: faker.lorem.sentence(),
            order: faker.number.int(),
            seo: {
                title: faker.lorem.words(2),
                description: faker.lorem.sentence(),
                image: faker.image.url(),
            },
            postIds: [faker.string.uuid()],
        };

        const expected = {
            slug: form.slug,
            title: form.title,
            description: form.description,
            order: form.order,
            seo: form.seo,
        };

        expect(toSectionCreate(form)).toEqual(expected);
        expect(toSectionUpdate(form)).toEqual(expected);
    });
});
