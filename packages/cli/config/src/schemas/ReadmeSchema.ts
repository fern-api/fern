import { z } from "zod";
import { SdkTargetLanguageSchema } from "./SdkTargetLanguageSchema.js";

export const ReadmeEndpointSchema = z.union([
    z.string(),
    z.object({
        method: z.string(),
        path: z.string(),
        stream: z.boolean().optional()
    })
]);

export type ReadmeEndpointSchema = z.infer<typeof ReadmeEndpointSchema>;

export const ReadmeCustomSectionSchema = z.object({
    title: z.string(),
    language: SdkTargetLanguageSchema.optional(),
    content: z.string()
});

export type ReadmeCustomSectionSchema = z.infer<typeof ReadmeCustomSectionSchema>;

export const ExampleStyleSchema = z.enum(["minimal", "comprehensive"]);

export type ExampleStyleSchema = z.infer<typeof ExampleStyleSchema>;

export const ReadmeSchema = z.object({
    bannerLink: z.string().optional(),
    introduction: z.string().optional(),
    apiReferenceLink: z.string().optional(),
    apiName: z.string().optional(),
    disabledSections: z.array(z.string()).optional(),
    defaultEndpoint: ReadmeEndpointSchema.optional(),
    features: z.record(z.string(), z.array(ReadmeEndpointSchema)).optional(),
    customSections: z.array(ReadmeCustomSectionSchema).optional(),
    exampleStyle: ExampleStyleSchema.optional()
});

export type ReadmeSchema = z.infer<typeof ReadmeSchema>;
