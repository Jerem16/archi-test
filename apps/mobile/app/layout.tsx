import "./globals.scss";
import { Suspense, type ReactNode } from "react";
import { AuthProvider } from "../src/auth";
import RouteSync from "./RouteSync";

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="fr">
            <body>
                <AuthProvider>{children}</AuthProvider>
                <Suspense fallback={null}>
                    <RouteSync />
                </Suspense>
            </body>
        </html>
    );
}
