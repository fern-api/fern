import { z } from "zod";

export const BaseSwiftCustomConfigSchema = z.object({
    moduleName: z.string().optional(),
    clientClassName: z.string().optional(),
    environmentEnumName: z.string().optional()
});

export type BaseSwiftCustomConfigSchema = z.infer<typeof BaseSwiftCustomConfigSchema>;
