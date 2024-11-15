import { z } from "zod";
import { ModuleConfigSchema } from "./ModuleConfigSchema";

export const BaseGoCustomConfigSchema = z.object({
    packageName: z.string().optional(),
    importPath: z.string().optional(),
    module: ModuleConfigSchema.optional(),
    union: z.string().optional(),
    enableExplicitNull: z.boolean().optional(),
    includeLegacyClientOptions: z.boolean().optional(),
    alwaysSendRequiredProperties: z.boolean().optional()
});

export type BaseGoCustomConfigSchema = z.infer<typeof BaseGoCustomConfigSchema>;
