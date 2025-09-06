import { describe, it, expect, vi, beforeEach } from "vitest";
import { commentService } from "@src/entities/models/comment";
import { http, HttpResponse } from "msw";
import { server } from "@test/setup";

vi.mock("@src/entities/core/services/amplifyClient", () => import("@test/mocks/amplifyClient"));

vi.mock("@src/entities/core/auth", () => ({ canAccess: () => true }));

beforeEach(() => {
    server.use(
        http.post("http://test.local/get", ({ request }) => {
            const mode = request.headers.get("x-auth-mode");
            if (mode === "apiKey") return HttpResponse.text("denied", { status: 401 });
            return HttpResponse.json({ data: { id: 1 } });
        }),
        http.post("http://test.local/create", ({ request }) => {
            const mode = request.headers.get("x-auth-mode");
            if (mode !== "userPool") return HttpResponse.text("denied", { status: 401 });
            return HttpResponse.json({ data: { id: 1 } });
        }),
        http.post("http://test.local/update", ({ request }) => {
            const mode = request.headers.get("x-auth-mode");
            if (mode !== "userPool") return HttpResponse.text("denied", { status: 401 });
            return HttpResponse.json({ data: { id: 1 } });
        }),
        http.post("http://test.local/delete", ({ request }) => {
            const mode = request.headers.get("x-auth-mode");
            if (mode !== "userPool") return HttpResponse.text("denied", { status: 401 });
            return HttpResponse.json({ data: { id: 1 } });
        })
    );
});

describe("commentService", () => {
    it("get utilise le fallback d'authentification", async () => {
        const fetchSpy = vi.spyOn(global, "fetch");
        const res = await commentService.get({ id: "1" });
        expect(fetchSpy).toHaveBeenCalledTimes(2);
        const headers0 = (fetchSpy.mock.calls[0][1]?.headers as Record<string, string>)[
            "x-auth-mode"
        ];
        const headers1 = (fetchSpy.mock.calls[1][1]?.headers as Record<string, string>)[
            "x-auth-mode"
        ];
        expect(headers0).toBe("apiKey");
        expect(headers1).toBe("userPool");
        expect(res.data).toEqual({ id: 1 });
        fetchSpy.mockRestore();
    });

    it("create utilise userPool", async () => {
        const fetchSpy = vi.spyOn(global, "fetch");
        const res = await commentService.create({ content: "", userNameId: "" });
        expect(fetchSpy).toHaveBeenCalledTimes(1);
        const headers = (fetchSpy.mock.calls[0][1]?.headers as Record<string, string>)[
            "x-auth-mode"
        ];
        expect(headers).toBe("userPool");
        expect(res.data).toEqual({ id: 1 });
        fetchSpy.mockRestore();
    });

    it("update utilise userPool", async () => {
        const fetchSpy = vi.spyOn(global, "fetch");
        const res = await commentService.update({ id: "1", content: "" });
        expect(fetchSpy).toHaveBeenCalledTimes(1);
        const headers = (fetchSpy.mock.calls[0][1]?.headers as Record<string, string>)[
            "x-auth-mode"
        ];
        expect(headers).toBe("userPool");
        expect(res.data).toEqual({ id: 1 });
        fetchSpy.mockRestore();
    });

    it("delete utilise userPool", async () => {
        const fetchSpy = vi.spyOn(global, "fetch");
        const res = await commentService.delete({ id: "1" });
        expect(fetchSpy).toHaveBeenCalledTimes(1);
        const headers = (fetchSpy.mock.calls[0][1]?.headers as Record<string, string>)[
            "x-auth-mode"
        ];
        expect(headers).toBe("userPool");
        expect(res.data).toEqual({ id: 1 });
        fetchSpy.mockRestore();
    });
});
