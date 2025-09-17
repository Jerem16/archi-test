"use client";

import React from "react";
import { MarkdownViewer } from "@packages/ui";
import styles from "./page.module.scss";

const demo = `# Bienvenue
Ce projet **Next 15** utilise \`react-markdown\` + \`remark-gfm\`.

- UI partagée : \`@packages/ui\`
- Logique métier : \`@packages/domain\`
- Services (Amplify) : \`@packages/services\`
- Types : \`@packages/types\`

> Édite ce fichier dans \`apps/desktop/app/page.tsx\`.
`;

export default function Page() {
  return (
    <main className={styles.main}>
      <MarkdownViewer markdown={demo} />
    </main>
  );
}
