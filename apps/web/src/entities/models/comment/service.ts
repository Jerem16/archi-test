import { client, crudService } from "@src/entities/core";
import type { CommentCreateInput, CommentUpdateInput } from "@src/types/models/comment";

export const commentService = crudService<
    "Comment",
    CommentCreateInput,
    CommentUpdateInput & { id: string },
    { id: string },
    { id: string }
>("Comment", {
    auth: { read: ["apiKey", "userPool"], write: "userPool" },
});

export function useCommentService() {
    return client.models.Comment;
}
