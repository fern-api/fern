import { z } from "zod";

export const HeaderAuthSchemeSchema = z.strictObject({
    header: z.string(),
    name: z.optional(z.string()),
    type: z.optional(z.string()),
    prefix: z.optional(z.string()),
});

export type HeaderAuthSchemeSchema = z.infer<typeof HeaderAuthSchemeSchema>;
