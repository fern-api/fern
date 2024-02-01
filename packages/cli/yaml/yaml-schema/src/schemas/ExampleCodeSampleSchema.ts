import { z } from "zod";
import { WithNameAndDocsSchema } from "./WithNameAndDocsSchema";

export const SupportedLanguageSchema = z.enum(["curl", "python", "javascript", "js", "node", "typescript", "ts", "go"]);

export type SupportedLanguageSchema = z.infer<typeof SupportedLanguageSchema>;

export const ExampleCodeSampleSchema = WithNameAndDocsSchema.extend({
    language: z.union([SupportedLanguageSchema, z.string()]),
    code: z.string(),
    install: z.optional(z.string())
});

export type ExampleCodeSampleSchema = z.infer<typeof ExampleCodeSampleSchema>;
