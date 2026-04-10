import { z } from "zod";
import { GeneratorImageSchema } from "./GeneratorImageSchema.js";
import { MetadataSchema } from "./MetadataSchema.js";
import { OutputSchema } from "./OutputSchema.js";
import { PublishSchema } from "./PublishSchema.js";
import { ReadmeSchema } from "./ReadmeSchema.js";
import { SdkTargetLanguageSchema } from "./SdkTargetLanguageSchema.js";

export const SdkTargetSchema = z.object({
    api: z.string().optional(),
    lang: SdkTargetLanguageSchema.optional(),
    image: GeneratorImageSchema.optional(),
    version: z.string().optional(),
    config: z.record(z.string(), z.unknown()).optional(),
    publish: PublishSchema.optional(),
    output: OutputSchema,
    group: z.array(z.string()).optional(),
    metadata: MetadataSchema.optional(),
    readme: ReadmeSchema.optional()
});

export type SdkTargetSchema = z.infer<typeof SdkTargetSchema>;
