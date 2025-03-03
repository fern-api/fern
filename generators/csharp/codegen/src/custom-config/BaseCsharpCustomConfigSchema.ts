import { z } from "zod";

export const BaseCsharpCustomConfigSchema = z.object({
    namespace: z.string().optional(),
    "simplify-object-dictionaries": z.boolean().optional(),
    "read-only-memory-types": z.optional(z.array(z.string())),
    "experimental-enable-forward-compatible-enums": z.boolean().optional(),
    "package-id": z.string().optional(),
    "custom-pager-name": z.string().optional()
});

export type BaseCsharpCustomConfigSchema = z.infer<typeof BaseCsharpCustomConfigSchema>;
