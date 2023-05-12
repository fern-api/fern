import { z } from "zod";
import { WithNameSchema } from "./WithNameSchema";

export const BasicAuthSchemeSchema = z.strictObject({
    scheme: z.literal("basic"),
    username: z.optional(WithNameSchema),
    password: z.optional(WithNameSchema),
});

export type BasicAuthSchemeSchema = z.infer<typeof BasicAuthSchemeSchema>;
