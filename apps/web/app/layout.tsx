import "./globals.scss";
import React, { PropsWithChildren } from "react";
import { Amplify } from "aws-amplify";
import amplifyConfig from "../src/amplify/config";
import AmplifyThemeProvider from "../src/ui/AmplifyThemeProvider";

Amplify.configure(amplifyConfig);

export default function RootLayout({ children }: PropsWithChildren) {
    return (
        <html lang="fr">
            <body>
                <AmplifyThemeProvider>{children}</AmplifyThemeProvider>
            </body>
        </html>
    );
}
