import { describe, it, expect, vi, beforeEach } from "vitest";
import { todoService } from "@src/entities/models/todo";
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

describe("todoService", () => {
    it("get utilise le fallback d'authentification", async () => {
        const fetchSpy = vi.spyOn(global, "fetch");
        const res = await todoService.get({ id: "1" });
        const calls = fetchSpy.mock.calls as [RequestInfo, RequestInit][];
        expect(fetchSpy).toHaveBeenCalledTimes(2);
        expect(new Headers(calls[0][1].headers).get("x-auth-mode")).toBe("apiKey");
        expect(new Headers(calls[1][1].headers).get("x-auth-mode")).toBe("userPool");
        expect(res.data).toEqual({ id: 1 });
        fetchSpy.mockRestore();
    });

    it("create utilise userPool", async () => {
        const fetchSpy = vi.spyOn(global, "fetch");
        const res = await todoService.create({ content: "" });
        const calls = fetchSpy.mock.calls as [RequestInfo, RequestInit][];
        expect(fetchSpy).toHaveBeenCalledTimes(1);
        expect(new Headers(calls[0][1].headers).get("x-auth-mode")).toBe("userPool");
        expect(res.data).toEqual({ id: 1 });
        fetchSpy.mockRestore();
    });

    it("update utilise userPool", async () => {
        const fetchSpy = vi.spyOn(global, "fetch");
        const res = await todoService.update({ id: "1", content: "" });
        const calls = fetchSpy.mock.calls as [RequestInfo, RequestInit][];
        expect(fetchSpy).toHaveBeenCalledTimes(1);
        expect(new Headers(calls[0][1].headers).get("x-auth-mode")).toBe("userPool");
        expect(res.data).toEqual({ id: 1 });
        fetchSpy.mockRestore();
    });

    it("delete utilise userPool", async () => {
        const fetchSpy = vi.spyOn(global, "fetch");
        const res = await todoService.delete({ id: "1" });
        const calls = fetchSpy.mock.calls as [RequestInfo, RequestInit][];
        expect(fetchSpy).toHaveBeenCalledTimes(1);
        expect(new Headers(calls[0][1].headers).get("x-auth-mode")).toBe("userPool");
        expect(res.data).toEqual({ id: 1 });
        fetchSpy.mockRestore();
    });
});
