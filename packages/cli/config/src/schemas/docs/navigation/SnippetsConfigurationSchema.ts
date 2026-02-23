import { z } from "zod";

export const SnippetLanguageConfigurationSchema = z.object({
    package: z.string(),
    version: z.string().optional(),
    sdk: z.string().optional()
});

export type SnippetLanguageConfigurationSchema = z.infer<typeof SnippetLanguageConfigurationSchema>;

export const VersionedSnippetLanguageConfigurationSchema = z.object({
    package: z.string(),
    version: z.string(),
    sdk: z.string().optional()
});

export type VersionedSnippetLanguageConfigurationSchema = z.infer<typeof VersionedSnippetLanguageConfigurationSchema>;

export const SnippetsConfigurationSchema = z.object({
    python: z.union([z.string(), SnippetLanguageConfigurationSchema]).optional(),
    typescript: z.union([z.string(), SnippetLanguageConfigurationSchema]).optional(),
    go: z.union([z.string(), SnippetLanguageConfigurationSchema]).optional(),
    java: z.union([z.string(), SnippetLanguageConfigurationSchema]).optional(),
    ruby: z.union([z.string(), SnippetLanguageConfigurationSchema]).optional(),
    csharp: z.union([z.string(), SnippetLanguageConfigurationSchema]).optional(),
    swift: z.union([z.string(), SnippetLanguageConfigurationSchema]).optional(),
    php: z.union([z.string(), SnippetLanguageConfigurationSchema]).optional(),
    rust: z.union([z.string(), SnippetLanguageConfigurationSchema]).optional()
});

export type SnippetsConfigurationSchema = z.infer<typeof SnippetsConfigurationSchema>;
