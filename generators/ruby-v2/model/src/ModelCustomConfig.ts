import { z } from "zod";

export const ModelCustomConfigSchema = z.object({
    clientModuleName: z.optional(z.string()),
    typesModuleName: z.optional(z.string()).default("Types")
});

export type ModelCustomConfigSchema = z.infer<typeof ModelCustomConfigSchema>;