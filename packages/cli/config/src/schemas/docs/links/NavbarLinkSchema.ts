import { z } from "zod";

export const NavbarLinkConfigSchema = z.object({
    href: z.string(),
    text: z.string(),
    icon: z.string().optional(),
    rightIcon: z.string().optional(),
    rounded: z.boolean().optional()
});

export type NavbarLinkConfigSchema = z.infer<typeof NavbarLinkConfigSchema>;

export const NavbarDropdownConfigSchema = z.object({
    text: z.string(),
    links: z.array(
        z.object({
            href: z.string(),
            text: z.string(),
            icon: z.string().optional()
        })
    )
});

export type NavbarDropdownConfigSchema = z.infer<typeof NavbarDropdownConfigSchema>;

export const NavbarGithubConfigSchema = z.union([
    z.string(),
    z.object({
        url: z.string(),
        text: z.string().optional()
    })
]);

export type NavbarGithubConfigSchema = z.infer<typeof NavbarGithubConfigSchema>;

export const NavbarLinkSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("filled"),
        ...NavbarLinkConfigSchema.shape
    }),
    z.object({
        type: z.literal("outlined"),
        ...NavbarLinkConfigSchema.shape
    }),
    z.object({
        type: z.literal("minimal"),
        ...NavbarLinkConfigSchema.shape
    }),
    z.object({
        type: z.literal("github"),
        value: NavbarGithubConfigSchema
    }),
    z.object({
        type: z.literal("dropdown"),
        ...NavbarDropdownConfigSchema.shape
    })
]);

export type NavbarLinkSchema = z.infer<typeof NavbarLinkSchema>;
