import { z } from "zod";

export const BaseGoCustomConfigSchema = z.object({
    packageName: z.string().optional(),
    importPath: z.string().optional(),
    union: z.string().optional()
});

export type BaseGoCustomConfigSchema = z.infer<typeof BaseGoCustomConfigSchema>;
