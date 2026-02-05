/**
 * Supported SDK target languages.
 */
export const LANGUAGES = ["csharp", "go", "java", "php", "python", "ruby", "rust", "swift", "typescript"] as const;

export type Language = (typeof LANGUAGES)[number];
