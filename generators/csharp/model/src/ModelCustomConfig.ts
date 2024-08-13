import { z } from "zod";

export const ModelCustomConfigSchema = z.object({
    namespace: z.string().optional(),
    "simplify-object-dictionaries": z.boolean().optional()
});

export type ModelCustomConfigSchema = z.infer<typeof ModelCustomConfigSchema>;
