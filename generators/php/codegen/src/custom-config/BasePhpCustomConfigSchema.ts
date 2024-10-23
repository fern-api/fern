import { z } from "zod";

export const BasePhpCustomConfigSchema = z.object({
    namespace: z.string().optional()
});

export type BasePhpCustomConfigSchema = z.infer<typeof BasePhpCustomConfigSchema>;
