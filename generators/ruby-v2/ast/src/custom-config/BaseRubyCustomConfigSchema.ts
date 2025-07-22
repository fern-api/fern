import { z } from "zod";

export const BaseRubyCustomConfigSchema = z.object({
    clientModuleName: z.optional(z.string()),
    superclass: z.optional(z.object({
        name: z.string(),
        modules: z.array(z.string()).optional()
    })).default({
        name: "Model",
        modules: ["Internal", "Types"]
    })
});

export type BaseRubyCustomConfigSchema = z.infer<typeof BaseRubyCustomConfigSchema>;
