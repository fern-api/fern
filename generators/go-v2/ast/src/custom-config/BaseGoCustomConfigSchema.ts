import { z } from "zod";

import { ModuleConfigSchema } from "./ModuleConfigSchema";

export const BaseGoCustomConfigSchema = z.object({
    module: ModuleConfigSchema.optional(),
    packageName: z.string().optional(),
    importPath: z.string().optional(),

    alwaysSendRequiredProperties: z.boolean().optional(),
    clientConstructorName: z.string().optional(),
    clientName: z.string().optional(),
    enableExplicitNull: z.boolean().optional(),
    exportedClientName: z.string().optional(),
    includeLegacyClientOptions: z.boolean().optional(),
    inlinePathParameters: z.boolean().optional(),
    inlineFileProperties: z.boolean().optional(),
    packageLayout: z.enum(["flat", "nested"]).optional(),
    union: z.string().optional()
});

export type BaseGoCustomConfigSchema = z.infer<typeof BaseGoCustomConfigSchema>;
