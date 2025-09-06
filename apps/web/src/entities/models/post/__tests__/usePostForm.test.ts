import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { usePostForm } from "@src/entities/models/post/hooks";
import { type PostType } from "@src/entities/models/post/types";
import { postService } from "@src/entities/models/post/service";
import { syncPostToTags } from "@src/entities/relations/postTag";
import { syncPostToSections } from "@src/entities/relations/sectionPost";

vi.mock("@src/entities/models/post/service", () => ({
    postService: {
        create: vi.fn().mockResolvedValue({ data: { id: "post1" } }),
        update: vi.fn().mockResolvedValue({ data: { id: "post1" } }),
        list: vi.fn().mockResolvedValue({ data: [] }),
    },
}));

vi.mock("@src/entities/relations/postTag", () => ({
    syncPostToTags: vi.fn(),
    postTagService: { listByParent: vi.fn().mockResolvedValue([]) },
}));

vi.mock("@src/entities/relations/sectionPost", () => ({
    syncPostToSections: vi.fn(),
    sectionPostService: { listByChild: vi.fn().mockResolvedValue([]) },
}));

vi.mock("@src/entities/models/author/service", () => ({
    authorService: { list: vi.fn().mockResolvedValue({ data: [] }) },
}));

vi.mock("@src/entities/models/tag/service", () => ({
    tagService: { list: vi.fn().mockResolvedValue({ data: [] }) },
}));

vi.mock("@src/entities/models/section/service", () => ({
    sectionService: { list: vi.fn().mockResolvedValue({ data: [] }) },
}));

beforeEach(() => {
    vi.clearAllMocks();
});

describe("usePostForm", () => {
    it("gère la création, les toggles et le reset", async () => {
        const { result } = renderHook(() => usePostForm(null));

        act(() => {
            result.current.setFieldValue("title", "Titre");
            result.current.setFieldValue("authorId", "a1");
            result.current.toggleTag("tag1");
            result.current.toggleSection("section1");
        });

        await act(async () => {
            await result.current.submit();
        });

        expect(postService.create).toHaveBeenCalled();
        expect(result.current.form.tagIds).toEqual(["tag1"]);
        expect(result.current.form.sectionIds).toEqual(["section1"]);
        expect(result.current.mode).toBe("edit");

        act(() => {
            result.current.setFieldValue("title", "Nouveau");
            result.current.reset();
        });
        expect(result.current.form.title).toBe("Titre");
        expect(result.current.form.tagIds).toEqual(["tag1"]);
    });

    it("synchronise les tags et sections", async () => {
        const post: PostType = { id: "post1", authorId: "a1", seo: {} };
        const { result } = renderHook(() => usePostForm(post));

        act(() => {
            result.current.setForm({
                ...result.current.form,
                authorId: "a1",
                tagIds: ["tag1"],
                sectionIds: ["section1"],
            });
        });

        act(() => {
            result.current.toggleTag("tag1");
            result.current.toggleTag("tag2");
            result.current.toggleSection("section1");
            result.current.toggleSection("section2");
        });

        await act(async () => {
            await result.current.submit();
        });

        expect(syncPostToTags).toHaveBeenCalledWith("post1", ["tag2"]);
        expect(syncPostToSections).toHaveBeenCalledWith("post1", ["section2"]);
    });
});
