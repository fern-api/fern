import { z } from "zod";

export const SidebarThemeConfigSchema = z.object({
    showNavigationLinks: z.boolean().optional()
});

export type SidebarThemeConfigSchema = z.infer<typeof SidebarThemeConfigSchema>;

export const BodyThemeConfigSchema = z.object({
    showHeader: z.boolean().optional()
});

export type BodyThemeConfigSchema = z.infer<typeof BodyThemeConfigSchema>;

export const TabsThemeStyleSchema = z.enum(["default", "bubble"]);
export type TabsThemeStyleSchema = z.infer<typeof TabsThemeStyleSchema>;

export const TabsThemeObjectConfigSchema = z.object({
    style: TabsThemeStyleSchema.optional(),
    alignment: z.enum(["left", "center"]).optional(),
    placement: z.enum(["header", "sidebar"]).optional()
});
export type TabsThemeObjectConfigSchema = z.infer<typeof TabsThemeObjectConfigSchema>;

export const TabsThemeConfigSchema = z.union([TabsThemeStyleSchema, TabsThemeObjectConfigSchema]);
export type TabsThemeConfigSchema = z.infer<typeof TabsThemeConfigSchema>;

export const ThemeConfigSchema = z.object({
    sidebar: SidebarThemeConfigSchema.optional(),
    body: BodyThemeConfigSchema.optional(),
    tabs: TabsThemeConfigSchema.optional()
});

export type ThemeConfigSchema = z.infer<typeof ThemeConfigSchema>;
