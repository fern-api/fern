import { z } from "zod";
import { WithNameSchema } from "./WithNameSchema";

export const BearerAuthSchemeSchema = z.strictObject({
    scheme: z.literal("bearer"),
    token: z.optional(WithNameSchema),
});

export type BearerAuthSchemeSchema = z.infer<typeof BearerAuthSchemeSchema>;
