import { BaseRustCustomConfigSchema } from "@fern-api/rust-base";
import { z } from "zod";

export const SdkCustomConfigSchema = BaseRustCustomConfigSchema.extend({
    clientName: z.string().optional(),
    generateExamples: z.boolean().optional().default(true)
});

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
