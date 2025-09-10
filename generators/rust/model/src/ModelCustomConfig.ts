import { BaseRustCustomConfigSchema } from "@fern-api/rust-base";
import { z } from "zod";

export const ModelCustomConfigSchema = BaseRustCustomConfigSchema.extend({
    generateBuilders: z.boolean().optional().default(false),
    deriveDebug: z.boolean().optional().default(true),
    deriveClone: z.boolean().optional().default(true)
});

export type ModelCustomConfigSchema = z.infer<typeof ModelCustomConfigSchema>;
