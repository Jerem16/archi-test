import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { TagType } from "@src/entities/models/tag/types";
import type { PostType } from "@src/entities/models/post/types";

vi.mock("@src/entities/models/tag/service", () => ({
    tagService: {
        list: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        deleteCascade: vi.fn(),
    },
}));

vi.mock("@src/entities/models/post/service", () => ({
    postService: {
        list: vi.fn(),
    },
}));

vi.mock("@src/entities/relations/postTag/service", () => ({
    postTagService: {
        list: vi.fn(),
        listByParent: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
    },
}));

import { tagService } from "@src/entities/models/tag/service";
import { postService } from "@src/entities/models/post/service";
import { postTagService } from "@src/entities/relations/postTag/service";
import { useTagForm } from "@src/entities/models/tag/hooks";

const tags: TagType[] = [
    { id: "t1", name: "Tag1" } as TagType,
    { id: "t2", name: "Tag2" } as TagType,
];
const posts: PostType[] = [{ id: "p1", title: "Post1" } as PostType];
const postTags = [{ postId: "p1", tagId: "t1" }];

beforeEach(() => {
    vi.resetAllMocks();
    (tagService.list as ReturnType<typeof vi.fn>).mockResolvedValue({ data: tags });
    (postService.list as ReturnType<typeof vi.fn>).mockResolvedValue({ data: posts });
    (postTagService.list as ReturnType<typeof vi.fn>).mockResolvedValue({ data: postTags });
    (postTagService.listByParent as ReturnType<typeof vi.fn>).mockImplementation(
        async (tagId: string) => (tagId === "t1" ? ["p1"] : [])
    );
});

describe("useTagForm", () => {
    it("listTags charge tags, posts et liaisons", async () => {
        const { result } = renderHook(() => useTagForm());
        await act(async () => {
            await result.current.listTags();
        });
        expect(result.current.extras.tags).toEqual(tags);
        expect(result.current.extras.posts).toEqual(posts);
        expect(result.current.extras.postTags).toEqual(postTags);
    });

    it("togglePost ajoute puis retire un post", async () => {
        const { result } = renderHook(() => useTagForm());
        await act(async () => {
            await result.current.listTags();
        });
        act(() => {
            result.current.togglePost("p1");
        });
        expect(result.current.form.postIds).toContain("p1");
        act(() => {
            result.current.togglePost("p1");
        });
        expect(result.current.form.postIds).not.toContain("p1");
    });

    it("selectById préremplit le formulaire et fixe tagId", async () => {
        const { result } = renderHook(() => useTagForm());
        await act(async () => {
            await result.current.listTags();
        });
        await act(async () => {
            await result.current.selectById("t1");
        });
        await waitFor(() => {
            expect(result.current.form).toEqual({ name: "Tag1", postIds: ["p1"] });
        });
        expect(result.current.tagId).toBe("t1");
    });

    it("reset réinitialise le formulaire", async () => {
        const { result } = renderHook(() => useTagForm());
        await act(async () => {
            await result.current.listTags();
        });
        await act(async () => {
            await result.current.selectById("t1");
        });
        act(() => {
            result.current.reset();
        });
        expect(result.current.form).toEqual({ name: "", postIds: [] });
    });

    it("deleteEntity supprime le tag et réinitialise tagId", async () => {
        const deleteTagMock = tagService.deleteCascade as ReturnType<typeof vi.fn>;
        deleteTagMock.mockResolvedValue({});
        vi.spyOn(window, "confirm").mockReturnValue(true);
        const { result } = renderHook(() => useTagForm());
        await act(async () => {
            await result.current.listTags();
        });
        await act(async () => {
            await result.current.selectById("t1");
        });
        await act(async () => {
            await result.current.deleteEntity("t1");
        });
        expect(deleteTagMock).toHaveBeenCalledWith({ id: "t1" });
        expect(result.current.tagId).toBeNull();
    });
});
