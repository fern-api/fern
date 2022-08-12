import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const HeaderAuthSchemeSchema = WithDocsSchema.extend({
    header: z.string(),
    name: z.optional(z.string()),
    type: z.string(),
});

export type HeaderAuthSchemeSchema = z.infer<typeof HeaderAuthSchemeSchema>;
