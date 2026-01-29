import { z } from "zod";

export const SdkTargetLanguageSchema = z.enum([
    "csharp",
    "go",
    "java",
    "php",
    "python",
    "ruby",
    "rust",
    "swift",
    "typescript"
]);

export type SdkTargetLanguageSchema = z.infer<typeof SdkTargetLanguageSchema>;
