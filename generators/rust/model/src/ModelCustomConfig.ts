import { BaseRustCustomConfigSchema } from "@fern-api/rust-codegen";
import { z } from "zod";

export const ModelCustomConfigSchema = BaseRustCustomConfigSchema.extend({
    generateBuilders: z.boolean().optional().default(false),
    deriveDebug: z.boolean().optional().default(true),
    deriveClone: z.boolean().optional().default(true),
    /**
     * Emit a manifest mapping each generated module back to the IR element that
     * produced it. Callers that split the models across several crates need it
     * because filenames are assigned by the collision registry and so cannot be
     * derived from the IR.
     */
    emitFileManifest: z.boolean().optional().default(false)
});

export type ModelCustomConfigSchema = z.infer<typeof ModelCustomConfigSchema>;
