import { z } from "zod";

export const LayoutConfigSchema = z.object({
    pageWidth: z.string().optional(),
    contentWidth: z.string().optional(),
    sidebarWidth: z.string().optional(),
    headerHeight: z.string().optional(),
    searchbarPlacement: z.enum(["header", "sidebar", "header-tabs"]).optional(),
    tabsPlacement: z.enum(["header", "sidebar"]).optional(),
    contentAlignment: z.enum(["center", "left"]).optional(),
    headerPosition: z.enum(["fixed", "static", "absolute"]).optional(),
    disableHeader: z.boolean().optional()
});

export type LayoutConfigSchema = z.infer<typeof LayoutConfigSchema>;
