import { z } from "zod";
import { OutputSchema } from "./OutputSchema";
import { PublishSchema } from "./PublishSchema";

export const SdkTargetSchema = z.object({
    lang: z.string().optional(),
    version: z.string().optional(),
    config: z.record(z.string(), z.unknown()).optional(),
    publish: PublishSchema.optional(),
    output: OutputSchema.optional(),
    group: z.array(z.string()).optional()
});

export type SdkTargetSchema = z.infer<typeof SdkTargetSchema>;
