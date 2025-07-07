import { z } from "zod";

export const ModelCustomConfigSchema = z.object({
    "use-discriminated-unions": z.boolean().optional()
});

export type ModelCustomConfigSchema = z.infer<typeof ModelCustomConfigSchema>;
