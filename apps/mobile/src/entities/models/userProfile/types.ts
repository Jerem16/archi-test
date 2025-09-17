import type { BaseModel, CreateOmit, UpdateInput, ModelForm } from "@src/entities/core";

export type UserProfileType = BaseModel<"UserProfile">;
export type UserProfileTypeOmit = CreateOmit<"UserProfile">;
export type UserProfileTypeUpdateInput = UpdateInput<"UserProfile">;
export type UserProfileFormType = ModelForm<"UserProfile">;

export type UserProfileMinimalType = {
    firstName: string;
    familyName: string;
    address: string;
    postalCode: string;
    city: string;
    country: string;
    phoneNumber: string;
};
