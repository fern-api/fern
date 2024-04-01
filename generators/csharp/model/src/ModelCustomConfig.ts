import { z } from "zod";

export const ModelCustomConfigSchema = z.object({
    namespace: z.string().optional()
});

export type ModelCustomConfigSchema = z.infer<typeof ModelCustomConfigSchema>;
