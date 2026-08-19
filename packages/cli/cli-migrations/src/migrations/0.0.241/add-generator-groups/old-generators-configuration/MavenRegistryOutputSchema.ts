import { z } from "zod";

export const MavenRegistryOutputSchema = z.strictObject({
    url: z.optional(z.string()),
    coordinate: z.string(),
    username: z.optional(z.string()),
    password: z.optional(z.string())
});

export type MavenRegistryOutputSchema = z.infer<typeof MavenRegistryOutputSchema>;
