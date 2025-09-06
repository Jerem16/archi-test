import { describe, it, expect, vi, beforeEach } from "vitest";
import { crudService } from "@src/entities/core/services";
import { http, HttpResponse } from "msw";
import { server } from "@test/setup";

vi.mock("@src/entities/core/services/amplifyClient", () => import("@test/mocks/amplifyClient"));

vi.mock("@src/entities/core/auth", () => ({
    canAccess: (_user: unknown, entity: { allow: boolean }) => Boolean(entity.allow),
}));

beforeEach(() => {
    server.use(
        http.post("http://test.local/list", ({ request }) => {
            const mode = request.headers.get("x-auth-mode");
            if (mode === "apiKey") return HttpResponse.text("denied", { status: 401 });
            return HttpResponse.json({
                data: [
                    { id: 1, allow: true },
                    { id: 2, allow: false },
                ],
            });
        }),
        http.post("http://test.local/get", ({ request }) => {
            const mode = request.headers.get("x-auth-mode");
            if (mode === "apiKey") return HttpResponse.text("denied", { status: 401 });
            return HttpResponse.json({ data: { id: 1, allow: false } });
        }),
        http.post("http://test.local/create", ({ request }) => {
            const mode = request.headers.get("x-auth-mode");
            if (mode === "apiKey") return HttpResponse.text("denied", { status: 401 });
            return HttpResponse.json({ data: { id: 1 } });
        }),
        http.post("http://test.local/update", ({ request }) => {
            const mode = request.headers.get("x-auth-mode");
            if (mode === "apiKey") return HttpResponse.text("denied", { status: 401 });
            return HttpResponse.json({ data: { id: 1 } });
        }),
        http.post("http://test.local/delete", ({ request }) => {
            const mode = request.headers.get("x-auth-mode");
            if (mode === "apiKey") return HttpResponse.text("denied", { status: 401 });
            return HttpResponse.json({ data: { id: 1 } });
        })
    );
});

describe("crudService", () => {
    const svc = crudService("Todo", {
        auth: { read: ["apiKey", "userPool"], write: ["apiKey", "userPool"] },
    }) as ReturnType<typeof crudService<"Todo">>;

    it("list utilise le fallback et filtre selon canAccess", async () => {
        const fetchSpy = vi.spyOn(global, "fetch");
        const res = await svc.list();
        expect(fetchSpy).toHaveBeenCalledTimes(2);
        expect(
            ((fetchSpy.mock.calls[0][1] as RequestInit).headers as Record<string, string>)[
                "x-auth-mode"
            ]
        ).toBe("apiKey");
        expect(
            ((fetchSpy.mock.calls[1][1] as RequestInit).headers as Record<string, string>)[
                "x-auth-mode"
            ]
        ).toBe("userPool");
        expect(res.data).toEqual([{ id: 1, allow: true }]);
        fetchSpy.mockRestore();
    });

    it("get utilise le fallback et renvoie undefined si non accessible", async () => {
        const fetchSpy = vi.spyOn(global, "fetch");
        const res = await svc.get({ id: "1" });
        expect(fetchSpy).toHaveBeenCalledTimes(2);
        expect(res.data).toBeUndefined();
        fetchSpy.mockRestore();
    });

    it("create utilise le fallback", async () => {
        const fetchSpy = vi.spyOn(global, "fetch");
        const res = await svc.create({ content: "" });
        expect(fetchSpy).toHaveBeenCalledTimes(2);
        expect(res.data).toEqual({ id: 1 });
        fetchSpy.mockRestore();
    });

    it("update utilise le fallback", async () => {
        const fetchSpy = vi.spyOn(global, "fetch");
        const res = await svc.update({ id: "1", content: "" });
        expect(fetchSpy).toHaveBeenCalledTimes(2);
        expect(res.data).toEqual({ id: 1 });
        fetchSpy.mockRestore();
    });

    it("delete utilise le fallback", async () => {
        const fetchSpy = vi.spyOn(global, "fetch");
        const res = await svc.delete({ id: "1" });
        expect(fetchSpy).toHaveBeenCalledTimes(2);
        expect(res.data).toEqual({ id: 1 });
        fetchSpy.mockRestore();
    });
});
