import { z } from "zod";
import { AuthVariableSchema } from "./AuthVariableSchema";

export const BearerAuthSchemeSchema = z.strictObject({
    scheme: z.literal("bearer"),
    token: z.optional(AuthVariableSchema),
});

export type BearerAuthSchemeSchema = z.infer<typeof BearerAuthSchemeSchema>;
