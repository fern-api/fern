import { z } from "zod";

export const BaseCsharpCustomConfigSchema = z.object({
    namespace: z.string().optional(),
    "simplify-object-dictionaries": z.boolean().optional(),
    "read-only-memory-types": z.optional(z.array(z.string())),
    "package-id": z.string().optional()
});

export type BaseCsharpCustomConfigSchema = z.infer<typeof BaseCsharpCustomConfigSchema>;
