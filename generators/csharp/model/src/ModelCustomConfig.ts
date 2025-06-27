import { z } from "zod";

export const ModelCustomConfigSchema = z.object({
    namespace: z.string().optional(),
    "simplify-object-dictionaries": z.boolean().optional(),
    "read-only-memory-types": z.optional(z.array(z.string())),
    "experimental-enable-forward-compatible-enums": z.boolean().optional(),
    "experimental-additional-properties": z.boolean().optional(),
    "enable-forward-compatible-enums": z.boolean().optional(),
    "additional-properties": z.boolean().optional(),
    "package-id": z.string().optional(),
    "use-discriminated-unions": z.boolean().optional()
});

export type ModelCustomConfigSchema = z.infer<typeof ModelCustomConfigSchema>;
