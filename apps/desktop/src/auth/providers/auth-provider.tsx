// app/auth-provider.tsx
"use client";

import "@packages/services/amplify"; // déclenche configure() au chargement du module
import { useAmplifyReady } from "@packages/services/amplify";
import { Authenticator } from "@aws-amplify/ui-react";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const ready = useAmplifyReady();

    if (!ready) return null; // ou un loader <div>...</div>

    return <Authenticator.Provider>{children}</Authenticator.Provider>;
}
