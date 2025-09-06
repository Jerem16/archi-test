import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useAuthorForm } from "@src/entities/models/author/hooks";
import { authorService } from "@src/entities/models/author/service";
import { type AuthorType } from "@src/entities/models/author/types";

vi.mock("@src/entities/models/author/service", () => ({
    authorService: {
        create: vi.fn(),
        update: vi.fn(),
        list: vi.fn().mockResolvedValue({ data: [] }),
    },
}));

describe("useAuthorForm", () => {
    it("gère la création puis le reset", async () => {
        (authorService.create as unknown as vi.Mock).mockResolvedValue({ data: { id: "a1" } });
        const { result } = renderHook(() => useAuthorForm(null));

        act(() => {
            result.current.setFieldValue("authorName", "John");
        });

        await act(async () => {
            await result.current.submit();
        });

        expect(authorService.create).toHaveBeenCalled();
        expect(result.current.mode).toBe("edit");

        act(() => result.current.setFieldValue("authorName", "Jane"));
        act(() => result.current.reset());
        expect(result.current.form.authorName).toBe("John");
    });

    it("gère la mise à jour", async () => {
        (authorService.update as unknown as vi.Mock).mockResolvedValue({ data: { id: "a1" } });
        const author: AuthorType = {
            id: "a1",
            authorName: "John",
            avatar: "",
            bio: "",
            email: "",
            order: 1,
        };
        const { result } = renderHook(() => useAuthorForm(author));

        await waitFor(() => {
            expect(result.current.mode).toBe("edit");
            expect(result.current.form.authorName).toBe("John");
        });

        act(() => result.current.setFieldValue("authorName", "Jane"));
        await act(async () => {
            await result.current.submit();
        });

        expect(authorService.update).toHaveBeenCalledWith({
            id: "a1",
            authorName: "Jane",
            avatar: "",
            bio: "",
            email: "",
            order: 1,
        });
    });
});
