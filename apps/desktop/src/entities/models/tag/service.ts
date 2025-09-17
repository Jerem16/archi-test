import { crudService, deleteEdges } from "@src/entities/core";
import { postTagService } from "@src/entities/relations/postTag/service";
import type { TagTypeOmit, TagTypeUpdateInput } from "@src/entities/models/tag/types";

const base = crudService<
    "Tag",
    Omit<TagTypeOmit, "posts">,
    TagTypeUpdateInput & { id: string },
    { id: string },
    { id: string }
>("Tag", {
    auth: { read: ["apiKey", "userPool"], write: "userPool" },
});

export const tagService = {
    ...base,
    async deleteCascade({ id }: { id: string }) {
        await deleteEdges(
            postTagService.list.bind(postTagService),
            async (edge) => {
                await postTagService.delete(edge.postId, edge.tagId);
            },
            "tagId",
            id
        );
        return base.delete({ id });
    },
};
