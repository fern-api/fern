import { z } from "zod";

export const BaseCustomConfigSchema = z.strictObject({
    clientClassName: z.optional(z.string())
});

export type BaseCustomConfigSchema = z.infer<typeof BaseCustomConfigSchema>;
