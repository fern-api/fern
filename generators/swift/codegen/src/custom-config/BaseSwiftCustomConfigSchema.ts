import { z } from "zod";

export const BaseSwiftCustomConfigSchema = z.object({
    clientClassName: z.string().optional()
});

export type BaseSwiftCustomConfigSchema = z.infer<typeof BaseSwiftCustomConfigSchema>;
