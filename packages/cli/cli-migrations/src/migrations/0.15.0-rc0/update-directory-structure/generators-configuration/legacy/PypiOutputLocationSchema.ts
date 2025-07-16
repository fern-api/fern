import { z } from "zod";

export const PypiOutputLocationSchema = z.strictObject({
    location: z.literal("pypi"),
    url: z.optional(z.string()),
    "package-name": z.string(),
    token: z.optional(z.string()),
    username: z.optional(z.string()),
    password: z.optional(z.string())
});

export type PostmanOutputLocationSchema = z.infer<typeof PypiOutputLocationSchema>;
