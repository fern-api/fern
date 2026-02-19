import { z } from "zod";

export const SidebarThemeConfigSchema = z.object({
    showNavigationLinks: z.boolean().optional()
});

export type SidebarThemeConfigSchema = z.infer<typeof SidebarThemeConfigSchema>;

export const BodyThemeConfigSchema = z.object({
    showHeader: z.boolean().optional()
});

export type BodyThemeConfigSchema = z.infer<typeof BodyThemeConfigSchema>;

export const TabsThemeConfigSchema = z.object({
    showNavigationLinks: z.boolean().optional()
});

export type TabsThemeConfigSchema = z.infer<typeof TabsThemeConfigSchema>;

export const ThemeConfigSchema = z.object({
    sidebar: SidebarThemeConfigSchema.optional(),
    body: BodyThemeConfigSchema.optional(),
    tabs: TabsThemeConfigSchema.optional()
});

export type ThemeConfigSchema = z.infer<typeof ThemeConfigSchema>;
