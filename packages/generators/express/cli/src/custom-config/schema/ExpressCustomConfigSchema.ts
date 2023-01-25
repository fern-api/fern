import { z } from "zod";

export const ExpressCustomConfigSchema = z.strictObject({
    useBrandedStringAliases: z.optional(z.boolean()),
});

export type ExpressCustomConfigSchema = z.infer<typeof ExpressCustomConfigSchema>;
