import { z } from "zod";

export const MavenRegistryOutputSchema = z.strictObject({
    coordinate: z.string(),
    username: z.string(),
    password: z.string()
});

export type MavenRegistryOutputSchema = z.infer<typeof MavenRegistryOutputSchema>;
