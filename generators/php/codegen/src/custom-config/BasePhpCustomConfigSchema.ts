import { z } from "zod";

export const BasePhpCustomConfigSchema = z.object({
    namespace: z.string().optional(),
    packageName: z.string().optional(),
    clientName: z.string().optional(),

    // Deprecated; use clientName instead.
    "client-class-name": z.string().optional()
});

export type BasePhpCustomConfigSchema = z.infer<typeof BasePhpCustomConfigSchema>;
