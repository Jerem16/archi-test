import type { BaseModel, UpdateInput, ModelForm, CreateOmit } from "@src/entities/core";

export type UserNameType = BaseModel<"UserName">;
export type UserNameTypeOmit = CreateOmit<"UserName">;
export type UserNameTypeCreateInput = { userName: string };
export type UserNameTypeUpdateInput = UpdateInput<"UserName">;
export type UserNameFormType = ModelForm<"UserName", "comments", "comments" | "postComments">;
