import type { BaseModel, CreateOmit, UpdateInput, ModelForm } from "@src/entities/core";

export type SeoType = BaseModel<"Seo">;
export type SeoTypeOmit = CreateOmit<"Seo">;
export type SeoTypeUpdateInput = UpdateInput<"Seo">;
export type SeoFormType = ModelForm<"Seo">;
