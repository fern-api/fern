import { z } from "zod";

export const NpmOutputLocationSchema = z.strictObject({
    location: z.literal("npm"),
    url: z.optional(z.string()),
    "package-name": z.string(),
    token: z.optional(z.string())
});

export type NpmOutputLocationSchema = z.infer<typeof NpmOutputLocationSchema>;
