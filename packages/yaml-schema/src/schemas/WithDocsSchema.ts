import { z } from "zod";

export const WithDocsSchema = z.strictObject({
    docs: z.string().optional(),
});

export type WithDocsSchema = z.infer<typeof WithDocsSchema>;
