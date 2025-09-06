import { crudService, setNullBatch } from "@src/entities/core";
import { postService } from "@src/entities/models/post/service";
import type { AuthorTypeOmit, AuthorTypeUpdateInput } from "@src/entities/models/author/types";

const base = crudService<
    "Author",
    Omit<AuthorTypeOmit, "posts">,
    AuthorTypeUpdateInput & { id: string },
    { id: string },
    { id: string }
>("Author", {
    auth: { read: ["apiKey", "userPool"], write: "userPool" },
});

export const authorService = {
    ...base,
    async deleteCascade({ id }: { id: string }) {
        await setNullBatch(
            postService.list,
            async (p) => {
                await postService.update(p as AuthorTypeUpdateInput & { id: string });
            },
            "authorId",
            id
        );
        return base.delete({ id });
    },
};
