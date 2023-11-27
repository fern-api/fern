import { z } from "zod";

export const WithDocsSchema = z.strictObject({
    docs: z.optional(z.string())
});

export type WithDocsSchema = z.infer<typeof WithDocsSchema>;
