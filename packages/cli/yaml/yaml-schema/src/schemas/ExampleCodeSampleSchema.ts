import { SupportedSdkLanguage } from "@fern-api/ir-sdk";
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
    "nodets", // alias to typescript
    "golang", // alias to go
    "c#", // alias to csharp
    "dotnet", // alias to csharp
    "jvm" // alias to java
]);

export type SupportedSdkLanguageSchema = z.infer<typeof SupportedSdkLanguageSchema>;

const RESOLVE_ALIAS: Partial<Record<SupportedSdkLanguageSchema, SupportedSdkLanguage>> = {
    js: "javascript",
    node: "javascript",
    ts: "typescript",
    nodets: "typescript",
    golang: "go",
    csharp: "csharp",
    dotnet: "csharp",
    jvm: "java"
};

export function convertSdkLanguageAlias(sdk: SupportedSdkLanguageSchema): SupportedSdkLanguage {
    return RESOLVE_ALIAS[sdk] ?? (sdk as SupportedSdkLanguage);
}

export const ExampleCodeSampleSchemaSdk = WithNameAndDocsSchema.extend({
    sdk: SupportedSdkLanguageSchema,
    code: z.string()
});

export type ExampleCodeSampleSchemaSdk = z.infer<typeof ExampleCodeSampleSchemaSdk>;

export const ExampleCodeSampleSchemaLanguage = WithNameAndDocsSchema.extend({
    language: z.string(),
    code: z.string(),
    install: z.optional(z.string())
});

export type ExampleCodeSampleSchemaLanguage = z.infer<typeof ExampleCodeSampleSchemaLanguage>;

export const ExampleCodeSampleSchema = z.union([ExampleCodeSampleSchemaSdk, ExampleCodeSampleSchemaLanguage]);

export type ExampleCodeSampleSchema = z.infer<typeof ExampleCodeSampleSchema>;
