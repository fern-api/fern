import { z } from "zod";

export const BaseCsharpCustomConfigSchema = z.object({
    namespace: z.string().optional(),
    "simplify-object-dictionaries": z.boolean().optional(),
    "read-only-memory-types": z.optional(z.array(z.string())),
    "experimental-enable-forward-compatible-enums": z.boolean().optional(),
    "package-id": z.string().optional(),
    "date-type": z.enum(["use-date-time", "use-date-only-on-net6+", "use-date-only-portable"]).optional()
});

export type BaseCsharpCustomConfigSchema = z.infer<typeof BaseCsharpCustomConfigSchema>;
