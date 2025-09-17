// src/entities/relations/sectionPost/sync.ts
import { createM2MSync } from "@src/entities/core/utils/createM2MSync";
import { sectionPostService } from "./service";

// sectionPostService doit venir de : relationService("SectionPost", "sectionId", "postId")

export const {
    /** Pour une SECTION donnée, synchroniser ses POSTS */
    syncByParent: syncSectionToPosts,
    /** Pour un POST donné, synchroniser ses SECTIONS */
    syncByChild: syncPostToSections,
} = createM2MSync(sectionPostService);
