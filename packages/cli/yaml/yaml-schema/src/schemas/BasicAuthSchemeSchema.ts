import { z } from "zod";
import { AuthVariableSchema } from "./AuthVariableSchema";

export const BasicAuthSchemeSchema = z.strictObject({
    scheme: z.literal("basic"),
    username: z.optional(AuthVariableSchema),
    password: z.optional(AuthVariableSchema)
});

export type BasicAuthSchemeSchema = z.infer<typeof BasicAuthSchemeSchema>;
