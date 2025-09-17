import { z, type ZodType } from "zod";
import { createModelForm } from "@src/entities/core";
import type { UserProfileType, UserProfileFormType, UserProfileTypeUpdateInput } from "./types";

export const {
    zodSchema: userProfileSchema,
    initialForm: initialUserProfileForm,
    toForm: toUserProfileForm,
    toCreate: toUserProfileCreate,
    toUpdate: toUserProfileUpdate,
} = createModelForm<
    UserProfileType,
    UserProfileFormType,
    UserProfileTypeUpdateInput,
    UserProfileTypeUpdateInput
>({
    zodSchema: z.object({
        firstName: z.string(),
        familyName: z.string(),
        address: z.string(),
        postalCode: z.string(),
        city: z.string(),
        country: z.string(),
        phoneNumber: z.string(),
    }) as ZodType<UserProfileFormType>,
    initialForm: {
        firstName: "",
        familyName: "",
        address: "",
        postalCode: "",
        city: "",
        country: "",
        phoneNumber: "",
    },
    toForm: (profile) => ({
        firstName: profile.firstName ?? "",
        familyName: profile.familyName ?? "",
        address: profile.address ?? "",
        postalCode: profile.postalCode ?? "",
        city: profile.city ?? "",
        country: profile.country ?? "",
        phoneNumber: profile.phoneNumber ?? "",
    }),
    toCreate: (form: UserProfileFormType): UserProfileTypeUpdateInput => ({
        ...form,
    }),
    toUpdate: (form: UserProfileFormType): UserProfileTypeUpdateInput => ({
        ...form,
    }),
});
