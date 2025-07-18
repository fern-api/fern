import { z } from "zod";

import { BaseRustCustomConfigSchema } from "@fern-api/rust-base";

export const SdkCustomConfigSchema = BaseRustCustomConfigSchema.extend({
    clientName: z.string().optional(),
    generateExamples: z.boolean().optional().default(true)
});

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
