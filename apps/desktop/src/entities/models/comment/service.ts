import { client, crudService } from "@src/entities/core";

interface CommentCreateInput {
    content: string;
    postId: string;
}

type CommentUpdateInput = Partial<CommentCreateInput>;

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
