"use client";
import { PropsWithChildren } from "react";
import { ThemeProvider } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

export default function AmplifyThemeProvider({ children }: PropsWithChildren) {
    return <ThemeProvider>{children}</ThemeProvider>;
}
