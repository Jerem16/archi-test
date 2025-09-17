import {
    userProfileSchema,
    initialUserProfileForm,
    toUserProfileForm,
    toUserProfileCreate,
    toUserProfileUpdate,
} from "./form";

export const userProfileConfig = {
    auth: "owner",
    identifier: "id",
    fields: ["firstName", "familyName", "address", "postalCode", "city", "country", "phoneNumber"],
    zodSchema: userProfileSchema,
    toForm: toUserProfileForm,
    toCreate: toUserProfileCreate,
    toUpdate: toUserProfileUpdate,
    initialForm: initialUserProfileForm,
};
