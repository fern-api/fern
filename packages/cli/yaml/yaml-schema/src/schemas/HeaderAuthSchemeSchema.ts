import { z } from "zod";
import { AuthVariableSchema } from "./AuthVariableSchema";

export const HeaderAuthSchemeSchema = AuthVariableSchema.extend({
    header: z.string(),
    type: z.optional(z.string()),
    prefix: z.optional(z.string()),
});

export type HeaderAuthSchemeSchema = z.infer<typeof HeaderAuthSchemeSchema>;
