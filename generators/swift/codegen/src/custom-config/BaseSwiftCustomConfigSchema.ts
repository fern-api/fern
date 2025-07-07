import { z } from "zod";

export const BaseSwiftCustomConfigSchema = z.object({
    "use-discriminated-unions": z.boolean().optional()
});

export type BaseSwiftCustomConfigSchema = z.infer<typeof BaseSwiftCustomConfigSchema>;
