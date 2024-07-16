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

export const ExampleCodeReferenceSchema = z.strictObject({
    $ref: z.string()
});

export type ExampleCodeReferenceSchema = z.infer<typeof ExampleCodeReferenceSchema>;

const UnresolvedCodeSampleSchema = WithNameAndDocsSchema.extend({
    code: z.union([z.string(), ExampleCodeReferenceSchema])
});

export const UnresolvedExampleCodeSampleSchemaSdk = UnresolvedCodeSampleSchema.extend({
    sdk: SupportedSdkLanguageSchema,
    code: z.string()
});

export type UnresolvedExampleCodeSampleSchemaSdk = z.infer<typeof UnresolvedExampleCodeSampleSchemaSdk>;

// Override code to be a string
export const ExampleCodeSampleSchemaSdk = UnresolvedExampleCodeSampleSchemaSdk.extend({
    code: z.string()
});

export type ExampleCodeSampleSchemaSdk = z.infer<typeof ExampleCodeSampleSchemaSdk>;

export const UnresolvedExampleCodeSampleSchemaLanguage = UnresolvedCodeSampleSchema.extend({
    language: z.string(),
    install: z.optional(z.string())
});

export type UnresolvedExampleCodeSampleSchemaLanguage = z.infer<typeof UnresolvedExampleCodeSampleSchemaLanguage>;

// Override code to be a string
export const ExampleCodeSampleSchemaLanguage = UnresolvedExampleCodeSampleSchemaLanguage.extend({
    code: z.string()
});

export type ExampleCodeSampleSchemaLanguage = z.infer<typeof ExampleCodeSampleSchemaLanguage>;

export const ExampleCodeSampleSchema = z.union([ExampleCodeSampleSchemaSdk, ExampleCodeSampleSchemaLanguage]);

export type ExampleCodeSampleSchema = z.infer<typeof ExampleCodeSampleSchema>;

export const UnresolvedExampleCodeSampleSchema = z.union([
    UnresolvedExampleCodeSampleSchemaSdk,
    UnresolvedExampleCodeSampleSchemaLanguage
]);

export type UnresolvedExampleCodeSampleSchema = z.infer<typeof UnresolvedExampleCodeSampleSchema>;
