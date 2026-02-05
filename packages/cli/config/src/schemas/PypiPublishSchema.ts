import { z } from "zod";

export const PypiMetadataSchema = z.object({
    keywords: z.array(z.string()).optional(),
    documentationLink: z.string().optional(),
    homepageLink: z.string().optional()
});

export type PypiMetadataSchema = z.infer<typeof PypiMetadataSchema>;

export const PypiPublishSchema = z.object({
    packageName: z.string(),
    url: z.string().optional(),
    token: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    metadata: PypiMetadataSchema.optional()
});

export type PypiPublishSchema = z.infer<typeof PypiPublishSchema>;
