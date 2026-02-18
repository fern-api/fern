import { z } from "zod";
import { NavigationItemSchema } from "./NavigationItemSchema.js";
import { TabbedNavigationItemSchema } from "./TabbedNavigationItemSchema.js";

export const UntabbedNavigationConfigSchema = z.array(NavigationItemSchema);

export type UntabbedNavigationConfigSchema = z.infer<typeof UntabbedNavigationConfigSchema>;

export const TabbedNavigationConfigSchema = z.array(TabbedNavigationItemSchema);

export type TabbedNavigationConfigSchema = z.infer<typeof TabbedNavigationConfigSchema>;

export const NavigationConfigSchema = z.union([UntabbedNavigationConfigSchema, TabbedNavigationConfigSchema]);

export type NavigationConfigSchema = z.infer<typeof NavigationConfigSchema>;
