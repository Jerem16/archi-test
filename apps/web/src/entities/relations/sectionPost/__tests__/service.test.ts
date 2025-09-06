import { describe, it, expect, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@test/setup";
import { sectionPostService } from "@src/entities/relations/sectionPost/service";
import type { ListRequest, CreateRequest, DeleteRequest } from "@test/fixtures/relations";

interface SectionPostIds {
    sectionId: string;
    postId: string;
}

vi.mock("@src/entities/core/services/amplifyClient", () => import("@test/mocks/amplifyClient"));

describe("sectionPostService", () => {
    it("listByParent retourne les IDs post", async () => {
        server.use(
            http.post("https://api.test/sectionPost/list", async ({ request }) => {
                const body = (await request.json()) as ListRequest<{
                    sectionId?: { eq?: string };
                    postId?: { eq?: string };
                }>;
                if (typeof body === "object" && body?.args?.filter?.sectionId?.eq === "section1") {
                    return HttpResponse.json({
                        data: [
                            { sectionId: "section1", postId: "post1" },
                            { sectionId: "section1", postId: "post2" },
                        ],
                    });
                }
                return HttpResponse.json({ data: [] });
            })
        );
        await expect(sectionPostService.listByParent("section1")).resolves.toEqual([
            "post1",
            "post2",
        ]);
    });

    it("listByChild retourne les IDs section", async () => {
        server.use(
            http.post("https://api.test/sectionPost/list", async ({ request }) => {
                const body = (await request.json()) as ListRequest<{
                    sectionId?: { eq?: string };
                    postId?: { eq?: string };
                }>;
                if (typeof body === "object" && body?.args?.filter?.postId?.eq === "post1") {
                    return HttpResponse.json({
                        data: [
                            { sectionId: "section1", postId: "post1" },
                            { sectionId: "section2", postId: "post1" },
                        ],
                    });
                }
                return HttpResponse.json({ data: [] });
            })
        );
        await expect(sectionPostService.listByChild("post1")).resolves.toEqual([
            "section1",
            "section2",
        ]);
    });

    it("create envoie les IDs corrects", async () => {
        let received: CreateRequest<SectionPostIds>;
        server.use(
            http.post("https://api.test/sectionPost/create", async ({ request }) => {
                received = (await request.json()) as CreateRequest<SectionPostIds>;
                return HttpResponse.json({ data: {} });
            })
        );
        await expect(sectionPostService.create("section1", "post3")).resolves.toBeUndefined();
        expect(received.data).toEqual({ sectionId: "section1", postId: "post3" });
    });

    it("delete envoie les IDs corrects", async () => {
        let received: DeleteRequest<SectionPostIds>;
        server.use(
            http.post("https://api.test/sectionPost/delete", async ({ request }) => {
                received = (await request.json()) as DeleteRequest<SectionPostIds>;
                return HttpResponse.json({ data: {} });
            })
        );
        await expect(sectionPostService.delete("section1", "post2")).resolves.toBeUndefined();
        expect(received.where).toEqual({ sectionId: "section1", postId: "post2" });
    });

    it("échoue avec authMode apiKey", async () => {
        let received: CreateRequest<SectionPostIds>;
        server.use(
            http.post("https://api.test/sectionPost/create", async ({ request }) => {
                received = (await request.json()) as CreateRequest<SectionPostIds>;
                return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
            })
        );
        await expect(
            sectionPostService.create("section1", "post1", { authMode: "apiKey" })
        ).rejects.toThrow();
        expect(received.opts.authMode).toBe("apiKey");
    });

    it("échoue avec authMode userPool", async () => {
        let received: DeleteRequest<SectionPostIds>;
        server.use(
            http.post("https://api.test/sectionPost/delete", async ({ request }) => {
                received = (await request.json()) as DeleteRequest<SectionPostIds>;
                return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
            })
        );
        await expect(
            sectionPostService.delete("section1", "post2", { authMode: "userPool" })
        ).rejects.toThrow();
        expect(received.opts.authMode).toBe("userPool");
    });
});
