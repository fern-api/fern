import { z } from "zod";

export const MetadataConfigSchema = z.object({
    "og:site_name": z.string().optional(),
    "og:title": z.string().optional(),
    "og:description": z.string().optional(),
    "og:url": z.string().optional(),
    "og:image": z.string().optional(),
    "og:image:width": z.number().optional(),
    "og:image:height": z.number().optional(),
    "og:locale": z.string().optional(),
    "og:logo": z.string().optional(),
    "twitter:title": z.string().optional(),
    "twitter:description": z.string().optional(),
    "twitter:handle": z.string().optional(),
    "twitter:image": z.string().optional(),
    "twitter:site": z.string().optional(),
    "twitter:url": z.string().optional(),
    "twitter:card": z.enum(["summary", "summary_large_image", "app", "player"]).optional(),
    noindex: z.boolean().optional(),
    nofollow: z.boolean().optional()
});

export type MetadataConfigSchema = z.infer<typeof MetadataConfigSchema>;
