// packages/ui/src/auth/aws-authenticator/AuthProvider.tsx
"use client";

import "@packages/services/amplify/setup"; 
import { useAmplifyReady } from "@packages/services/amplify/useAmplifyReady";
import { Authenticator } from "@aws-amplify/ui-react";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const ready = useAmplifyReady();

    if (!ready) return null; // ou un loader <div>...</div>

    return <Authenticator.Provider>{children}</Authenticator.Provider>;
}
