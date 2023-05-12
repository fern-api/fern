import { z } from "zod";

export const WithNameSchema = z.strictObject({
    name: z.optional(z.string()),
});

export type WithNameSchema = z.infer<typeof WithNameSchema>;
