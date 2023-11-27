import { z } from "zod";

export const NpmRegistryOutputSchema = z.strictObject({
    url: z.optional(z.string()),
    "package-name": z.string(),
    token: z.optional(z.string())
});

export type NpmRegistryOutputSchema = z.infer<typeof NpmRegistryOutputSchema>;
