import { z } from "zod";

export const WithDisplayNameSchema = z.strictObject({
    "display-name": z.optional(z.string())
});

export type WithDisplayNameSchema = z.infer<typeof WithDisplayNameSchema>;
