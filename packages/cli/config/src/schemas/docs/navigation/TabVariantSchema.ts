import { z } from "zod";
import { NavigationItemSchema } from "./NavigationItemSchema.js";

export const TabVariantSchema = z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    icon: z.string().optional(),
    layout: z.array(NavigationItemSchema),
    slug: z.string().optional(),
    default: z.boolean().optional()
});

export type TabVariantSchema = z.infer<typeof TabVariantSchema>;
