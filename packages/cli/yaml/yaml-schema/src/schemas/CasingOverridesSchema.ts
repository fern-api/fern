import { z } from "zod";

export const CasingOverridesSchema = z.object({
    camel: z.optional(z.string()),
    snake: z.optional(z.string()),
    pascal: z.optional(z.string()),
    "screaming-snake": z.optional(z.string())
});

export type CasingOverridesSchema = z.infer<typeof CasingOverridesSchema>;
