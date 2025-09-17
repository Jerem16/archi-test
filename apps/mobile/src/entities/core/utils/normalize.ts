// @src/entities/core/utils/normalize.ts
export function normalizeTagName(input: string): string {
    return (input ?? "")
        .trim()
        .toLowerCase()
        .normalize("NFD") // décompose les accents
        .replace(/\p{Diacritic}/gu, "") // supprime les diacritiques
        .replace(/\s+/g, " "); // espaces multiples -> simple
}
