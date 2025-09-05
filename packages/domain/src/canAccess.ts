import type { AuthRule, AuthUser } from "@packages/types";

export function canAccess(
    user: AuthUser | null,
    entity: Record<string, unknown>,
    rules: AuthRule[] = []
): boolean {
    for (const rule of rules) {
        switch (rule.allow) {
            case "owner": {
                const field = rule.ownerField ?? "owner";
                if (
                    user?.username &&
                    entity[field] !== undefined &&
                    entity[field] === user.username
                ) {
                    return true;
                }
                break;
            }
            case "groups": {
                if (user?.groups && rule.groups?.some((g) => user.groups?.includes(g))) {
                    return true;
                }
                break;
            }
            case "public":
                return true;
            case "private":
                if (user) return true;
                break;
            default:
                return false;
        }
    }
    return false;
}
