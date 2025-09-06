import { describe, it, expect, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@test/setup";
import { postTagService } from "@src/entities/relations/postTag/service";
import type { ListRequest, CreateRequest, DeleteRequest } from "@test/fixtures/relations";

interface PostTagIds {
    postId: string;
    tagId: string;
}

vi.mock("@src/entities/core/services/amplifyClient", () => import("@test/mocks/amplifyClient"));

describe("postTagService", () => {
    it("listByParent retourne les IDs tag", async () => {
        server.use(
            http.post("https://api.test/postTag/list", async ({ request }) => {
                const body = (await request.json()) as ListRequest<{
                    postId?: { eq?: string };
                    tagId?: { eq?: string };
                }>;
                if (typeof body === "object" && body?.args?.filter?.postId?.eq === "post1") {
                    return HttpResponse.json({
                        data: [
                            { postId: "post1", tagId: "tag1" },
                            { postId: "post1", tagId: "tag2" },
                        ],
                    });
                }
                return HttpResponse.json({ data: [] });
            })
        );
        await expect(postTagService.listByParent("post1")).resolves.toEqual(["tag1", "tag2"]);
    });

    it("listByChild retourne les IDs post", async () => {
        server.use(
            http.post("https://api.test/postTag/list", async ({ request }) => {
                const body = (await request.json()) as ListRequest<{
                    postId?: { eq?: string };
                    tagId?: { eq?: string };
                }>;
                if (typeof body === "object" && body?.args?.filter?.tagId?.eq === "tag1") {
                    return HttpResponse.json({
                        data: [
                            { postId: "post1", tagId: "tag1" },
                            { postId: "post2", tagId: "tag1" },
                        ],
                    });
                }
                return HttpResponse.json({ data: [] });
            })
        );
        await expect(postTagService.listByChild("tag1")).resolves.toEqual(["post1", "post2"]);
    });

    it("create envoie les IDs corrects", async () => {
        let received: CreateRequest<PostTagIds>;
        server.use(
            http.post("https://api.test/postTag/create", async ({ request }) => {
                received = (await request.json()) as CreateRequest<PostTagIds>;
                return HttpResponse.json({ data: {} });
            })
        );
        await expect(postTagService.create("post1", "tag3")).resolves.toBeUndefined();
        expect(received.data).toEqual({ postId: "post1", tagId: "tag3" });
    });

    it("delete envoie les IDs corrects", async () => {
        let received: DeleteRequest<PostTagIds>;
        server.use(
            http.post("https://api.test/postTag/delete", async ({ request }) => {
                received = (await request.json()) as DeleteRequest<PostTagIds>;
                return HttpResponse.json({ data: {} });
            })
        );
        await expect(postTagService.delete("post1", "tag2")).resolves.toBeUndefined();
        expect(received.where).toEqual({ postId: "post1", tagId: "tag2" });
    });

    it("échoue avec authMode apiKey", async () => {
        let received: CreateRequest<PostTagIds>;
        server.use(
            http.post("https://api.test/postTag/create", async ({ request }) => {
                received = (await request.json()) as CreateRequest<PostTagIds>;
                return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
            })
        );
        await expect(
            postTagService.create("post1", "tag1", { authMode: "apiKey" })
        ).rejects.toThrow();
        expect(received.opts.authMode).toBe("apiKey");
    });

    it("échoue avec authMode userPool", async () => {
        let received: DeleteRequest<PostTagIds>;
        server.use(
            http.post("https://api.test/postTag/delete", async ({ request }) => {
                received = (await request.json()) as DeleteRequest<PostTagIds>;
                return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
            })
        );
        await expect(
            postTagService.delete("post1", "tag2", { authMode: "userPool" })
        ).rejects.toThrow();
        expect(received.opts.authMode).toBe("userPool");
    });
});
