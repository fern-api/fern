import { z } from "zod";

export const ModelCustomConfigSchema = z.object({
    clientModuleName: z.optional(z.string()),
    typesModuleName: z.optional(z.string()).default("Types"),
    superclass: z.optional(z.object({
        name: z.string(),
        modules: z.array(z.string()).optional()
    })).default({
        name: "Model",
        modules: ["Internal", "Types"]
    })
});

export type ModelCustomConfigSchema = z.infer<typeof ModelCustomConfigSchema>;