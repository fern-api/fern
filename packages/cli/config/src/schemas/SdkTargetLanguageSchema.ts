import { z } from "zod";

export const SdkTargetLanguageSchema: z.ZodEnum<{
    csharp: "csharp";
    go: "go";
    java: "java";
    php: "php";
    python: "python";
    ruby: "ruby";
    rust: "rust";
    swift: "swift";
    typescript: "typescript";
}> = z.enum(["csharp", "go", "java", "php", "python", "ruby", "rust", "swift", "typescript"]);

export type SdkTargetLanguageSchema = z.infer<typeof SdkTargetLanguageSchema>;
