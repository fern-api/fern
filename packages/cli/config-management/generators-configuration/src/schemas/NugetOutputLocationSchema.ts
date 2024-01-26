import { z } from "zod";

export const NugetOutputLocationSchema = z.strictObject({
    location: z.literal("nuget"),
    url: z.optional(z.string()),
    "package-name": z.string(),
    "api-key": z.optional(z.string())
});

export type NugetOutputLocationSchema = z.infer<typeof NugetOutputLocationSchema>;
