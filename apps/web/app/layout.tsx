import "./globals.scss";
import React, { PropsWithChildren } from "react";
// import AuthProvider from "@src/auth/Authentication/auth-provider";


export default function RootLayout({ children }: PropsWithChildren) {
    return (
        <html lang="fr">
            <body>
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}
