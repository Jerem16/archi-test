import { defineStorage } from "@aws-amplify/backend";

export const PubliqueStorage = defineStorage({
    name: "PubliqueStorage",
    isDefault: true,
    access: (allow) => ({
        "publique-storage/*": [
            allow.guest.to(["read"]),
            allow.authenticated.to(["read", "write", "delete"]),
        ],
    }),
});
