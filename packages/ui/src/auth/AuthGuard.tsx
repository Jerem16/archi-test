// src/components/auth/AuthGuard.tsx
"use client";

import * as React from "react";
import { useEffect } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useRouter } from "next/navigation";
import { goToLoginWithReturn } from "./goToLoginWithReturn";

type Props = {
    children: React.ReactNode;
    /** Optionnel : contenu affiché pendant la vérif (loader, skeleton, etc.) */
    fallback?: React.ReactNode;
};

export default function AuthGuard({ children, fallback = null }: Props) {
    const { authStatus, user } = useAuthenticator((c) => [c.authStatus, c.user]);
    const router = useRouter();

    useEffect(() => {
        if (authStatus === "unauthenticated") {
            goToLoginWithReturn(router, { replace: true }); // replace pour ne pas polluer l’historique
        }
    }, [authStatus, router]);

    if (authStatus !== "authenticated" || !user) return <>{fallback}</>;
    return <>{children}</>;
}
