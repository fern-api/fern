import { z } from "zod";

export const BaseRubyCustomConfigSchema = z.object({
    clientClassName: z.optional(z.string())
});

export type BaseRubyCustomConfigSchema = z.infer<typeof BaseRubyCustomConfigSchema>;
