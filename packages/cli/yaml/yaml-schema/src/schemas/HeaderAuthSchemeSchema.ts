import { z } from "zod";
import { WithNameSchema } from "./WithNameSchema";

export const HeaderAuthSchemeSchema = WithNameSchema.extend({
    header: z.string(),
    type: z.optional(z.string()),
    prefix: z.optional(z.string()),
});

export type HeaderAuthSchemeSchema = z.infer<typeof HeaderAuthSchemeSchema>;
