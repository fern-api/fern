import { z } from "zod";

export const MavenOutputLocationSchema = z.strictObject({
    location: z.literal("maven"),
    url: z.optional(z.string()),
    coordinate: z.string(),
    username: z.optional(z.string()),
    password: z.optional(z.string())
});

export type MavenOutputLocationSchema = z.infer<typeof MavenOutputLocationSchema>;
