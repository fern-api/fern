import { z } from "zod";

export const MavenRegistryOutputSchema = z.strictObject({
    url: z.optional(z.string()),
    coordinate: z.string(),
    username: z.string(),
    password: z.string(),
});

export type MavenRegistryOutputSchema = z.infer<typeof MavenRegistryOutputSchema>;
