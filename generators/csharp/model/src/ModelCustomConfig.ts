import { z } from "zod";

export const ModelCustomConfigSchema = z.object({
    namespace: z.string().optional(),
    "simplify-object-dictionaries": z.boolean().optional(),
    "read-only-memory-types": z.optional(z.array(z.string())),
    "package-id": z.string().optional()
});

export type ModelCustomConfigSchema = z.infer<typeof ModelCustomConfigSchema>;
