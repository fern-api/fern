import { z } from "zod";

export const BaseRustCustomConfigSchema = z.object({
    clientName: z.string().optional(),
    inlinePathParameters: z.boolean().optional(),
    packageName: z.string().optional(),
    packagePath: z.string().optional(),
    propertyAccess: z.enum(["public", "private"]).optional(),
    namespace: z.string().optional(),
    composerJson: z.optional(z.record(z.any())),
    // Deprecated; use clientName instead.
    "client-class-name": z.string().optional()
});

export type BaseRustCustomConfigSchema = z.infer<typeof BaseRustCustomConfigSchema>;
