import { describe, it, expect } from "vitest";
import { faker } from "@faker-js/faker";
import {
    toUserProfileForm,
    toUserProfileCreate,
    toUserProfileUpdate,
} from "@src/entities/models/userProfile/form";
import type { UserProfileType, UserProfileFormType } from "@src/entities/models/userProfile/types";

describe("toUserProfileForm", () => {
    it("convertit UserProfileType en UserProfileFormType", () => {
        const profile = {
            firstName: faker.person.firstName(),
            familyName: faker.person.lastName(),
            address: faker.location.streetAddress(),
            postalCode: faker.location.zipCode(),
            city: faker.location.city(),
            country: faker.location.country(),
            phoneNumber: faker.phone.number(),
        } as unknown as UserProfileType;

        const form = toUserProfileForm(profile);
        expect(form).toEqual({
            firstName: profile.firstName,
            familyName: profile.familyName,
            address: profile.address,
            postalCode: profile.postalCode,
            city: profile.city,
            country: profile.country,
            phoneNumber: profile.phoneNumber,
        });
    });
});

describe("toUserProfileCreate / toUserProfileUpdate", () => {
    it("retourne l'objet tel quel", () => {
        const form: UserProfileFormType = {
            firstName: faker.person.firstName(),
            familyName: faker.person.lastName(),
            address: faker.location.streetAddress(),
            postalCode: faker.location.zipCode(),
            city: faker.location.city(),
            country: faker.location.country(),
            phoneNumber: faker.phone.number(),
        };

        expect(toUserProfileCreate(form)).toEqual(form);
        expect(toUserProfileUpdate(form)).toEqual(form);
    });
});
