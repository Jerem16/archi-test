import { relationService } from "@src/entities/core";

export const postTagService = relationService("PostTag", "postId", "tagId");
