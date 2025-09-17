// src/entities/relations/sectionPost/service.ts
import { relationService } from "@src/entities/core";

export const sectionPostService = relationService("SectionPost", "sectionId", "postId");
