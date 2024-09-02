import { z } from "zod";
import { WithNameSchema } from "./WithNameSchema";

export const AuthVariableSchema = WithNameSchema.extend({
    env: z.optional(z.string())
});

export type AuthVariableSchema = z.infer<typeof AuthVariableSchema>;
