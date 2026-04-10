/**
 * Supported SDK target languages.
 */
export const LANGUAGES = ["csharp", "go", "java", "php", "python", "ruby", "rust", "swift", "typescript"] as const;

export type Language = (typeof LANGUAGES)[number];

/**
 * Human-readable display names for each language.
 */
export const LANGUAGE_DISPLAY_NAMES: Record<Language, string> = {
    typescript: "TypeScript",
    python: "Python",
    go: "Go",
    java: "Java",
    csharp: "C#",
    ruby: "Ruby",
    php: "PHP",
    rust: "Rust",
    swift: "Swift"
};

/**
 * Preferred display order for language selection prompts.
 */
export const LANGUAGE_ORDER: Language[] = [
    "typescript",
    "python",
    "go",
    "java",
    "csharp",
    "ruby",
    "php",
    "rust",
    "swift"
];
