import { z } from "zod";

export const NpmRegistryOutputSchema = z.strictObject({
    "package-name": z.string(),
    token: z.string()
});

export type NpmRegistryOutputSchema = z.infer<typeof NpmRegistryOutputSchema>;
