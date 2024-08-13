import { z } from "zod";

export const BaseCsharpCustomConfigSchema = z.object({
    namespace: z.string().optional(),
    "simplify-object-dictionaries": z.boolean().optional()
});

export type BaseCsharpCustomConfigSchema = z.infer<typeof BaseCsharpCustomConfigSchema>;
