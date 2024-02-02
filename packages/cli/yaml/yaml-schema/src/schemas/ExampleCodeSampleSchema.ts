import { z } from "zod";
import { WithNameAndDocsSchema } from "./WithNameAndDocsSchema";

// be sure to keep this in sync with the list of Fern's SDKs
export const SupportedSdkLanguageSchema = z.enum([
    "curl",
    "python",
    "javascript",
    "typescript",
    "go",
    "ruby",
    "csharp",
    "java",
    "js", // alias to javascript
    "node", // alias to javascript
    "ts", // alias to typescript
    "node-ts", // alias to typescript
    "golang", // alias to go
    "c#", // alias to csharp
    "dotnet", // alias to csharp
    "jvm" // alias to java
]);

export type SupportedSdkLanguageSchema = z.infer<typeof SupportedSdkLanguageSchema>;

const ExampleCodeSampleSchemaSdk = WithNameAndDocsSchema.extend({
    sdk: SupportedSdkLanguageSchema,
    code: z.string()
});

const ExampleCodeSampleSchemaLanguage = WithNameAndDocsSchema.extend({
    language: z.string(),
    code: z.string(),
    install: z.optional(z.string())
});

export const ExampleCodeSampleSchema = z.union([ExampleCodeSampleSchemaSdk, ExampleCodeSampleSchemaLanguage]);

export type ExampleCodeSampleSchema = z.infer<typeof ExampleCodeSampleSchema>;
