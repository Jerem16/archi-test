// src/auth/goToLoginWithReturn.ts
export type Router = {
    push: (url: string) => void;
    replace: (url: string) => void;
};

export function goToLoginWithReturn(router: Router, opts?: { replace?: boolean }) {
    const method = opts?.replace ? router.replace : router.push;
    const returnTo = typeof window !== "undefined" ? window.location.pathname + window.location.search : "";
    const url = returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : "/login";
    method(url);
}
