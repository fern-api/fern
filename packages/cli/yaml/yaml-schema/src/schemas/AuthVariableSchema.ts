import { z } from "zod";
import { WithNameSchema } from "./WithNameSchema";

export const AuthVariableSchema = WithNameSchema.extend({
    "sdk-environment-variable": z.string(),
});

export type AuthVariableSchema = z.infer<typeof AuthVariableSchema>;
