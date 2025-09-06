export type AuthAllow = "owner" | "groups" | "public" | "private";

export interface AuthRule {
    allow: AuthAllow;
    ownerField?: string;
    groups?: string[]; // ✅ indispensable pour la règle "groups"
}

export interface AuthUser {
    username?: string | null;
    groups?: string[] | null;
}
