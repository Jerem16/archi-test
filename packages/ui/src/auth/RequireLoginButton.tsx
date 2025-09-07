// src/components/auth/RequireLoginButton.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { goToLoginWithReturn } from "./goToLoginWithReturn.ts";

type Props = {
    children: React.ReactNode;
    className?: string;
    onAuthed?: () => void; // action protégée si déjà connecté
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function RequireLoginButton({ children, className, onAuthed, ...rest }: Props) {
    const router = useRouter();
    const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);
    const isAuthed = authStatus === "authenticated";

    const onClick = React.useCallback(() => {
        if (!isAuthed) {
            goToLoginWithReturn(router); // push par défaut, garde l’URL de retour
            return;
        }
        onAuthed?.();
    }, [isAuthed, onAuthed, router]);

    return (
        <button type="button" className={className} onClick={onClick} {...rest}>
            {children}
        </button>
    );
}
