import { z } from "zod";
import { OutputSchema } from "./OutputSchema";
import { PublishSchema } from "./PublishSchema";
import { SdkTargetLanguageSchema } from "./SdkTargetLanguageSchema";

export const SdkTargetSchema = z.object({
    api: z.string().optional(),
    lang: SdkTargetLanguageSchema.optional(),
    image: z.string().optional(),
    version: z.string().optional(),
    config: z.record(z.string(), z.unknown()).optional(),
    publish: PublishSchema.optional(),
    output: OutputSchema,
    group: z.array(z.string()).optional()
});

export type SdkTargetSchema = z.infer<typeof SdkTargetSchema>;
