// src/entities/relations/postTag/sync.ts
import { createM2MSync } from "@src/entities/core/utils/createM2MSync";
import { postTagService } from "./service";

// postTagService doit venir de:
// relationService("PostTag", "postId", "tagId")

export const {
    /** Pour un TAG donné, synchroniser ses POSTS */
    syncByChild: syncTagToPosts,
    /** Pour un POST donné, synchroniser ses TAGS */
    syncByParent: syncPostToTags,
} = createM2MSync(postTagService);
