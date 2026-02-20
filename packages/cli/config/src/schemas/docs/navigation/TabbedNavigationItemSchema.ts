import { z } from "zod";
import { NavigationItemSchema } from "./NavigationItemSchema.js";
import { TabVariantSchema } from "./TabVariantSchema.js";

export const TabbedNavigationItemSchema = z.object({
    tab: z.string(),
    layout: z.array(NavigationItemSchema).optional(),
    variants: z.array(TabVariantSchema).optional()
});

export type TabbedNavigationItemSchema = z.infer<typeof TabbedNavigationItemSchema>;
