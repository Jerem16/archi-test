"use client";
import React, { PropsWithChildren } from "react"; // 👈 ajoute React ici
import { ThemeProvider } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

export default function AmplifyThemeProvider({ children }: PropsWithChildren) {
    return <ThemeProvider>{children}</ThemeProvider>;
}
