import { crudService, deleteEdges } from "@src/entities/core";
import { commentService } from "@src/entities/models/comment/service";
import { postTagService } from "@src/entities/relations/postTag/service";
import { sectionPostService } from "@src/entities/relations/sectionPost/service";
import type { PostTypeOmit, PostTypeUpdateInput } from "@src/entities/models/post/types";

const base = crudService<
    "Post",
    Omit<PostTypeOmit, "comments" | "author" | "sections" | "tags">,
    PostTypeUpdateInput & { id: string },
    { id: string },
    { id: string }
>("Post", {
    auth: { read: ["apiKey", "userPool"], write: "userPool" },
});

export const postService = {
    ...base,
    async deleteCascade({ id }: { id: string }) {
        await deleteEdges(
            commentService.list.bind(commentService),
            async (c) => {
                await commentService.delete({ id: c.id });
            },
            "postId",
            id
        );

        await deleteEdges(
            postTagService.list.bind(postTagService),
            async (edge) => {
                await postTagService.delete(edge.postId, edge.tagId);
            },
            "postId",
            id
        );

        await deleteEdges(
            sectionPostService.list.bind(sectionPostService),
            async (edge) => {
                await sectionPostService.delete(edge.sectionId, edge.postId);
            },
            "postId",
            id
        );

        return base.delete({ id });
    },
};
