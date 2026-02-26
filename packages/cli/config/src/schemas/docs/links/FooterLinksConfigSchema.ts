import { z } from "zod";

export const FooterLinkSchema = z.object({
    href: z.string(),
    text: z.string(),
    icon: z.string().optional()
});

export type FooterLinkSchema = z.infer<typeof FooterLinkSchema>;

export const FooterLinkGroupSchema = z.object({
    title: z.string().optional(),
    links: z.array(FooterLinkSchema)
});

export type FooterLinkGroupSchema = z.infer<typeof FooterLinkGroupSchema>;

export const FooterLinksConfigSchema = z.union([
    z.array(FooterLinkGroupSchema),
    z.record(z.string(), z.array(FooterLinkSchema))
]);

export type FooterLinksConfigSchema = z.infer<typeof FooterLinksConfigSchema>;
