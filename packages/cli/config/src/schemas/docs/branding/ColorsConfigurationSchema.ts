import { z } from "zod";
import { ColorConfigSchema } from "./ColorConfigSchema.js";

export const ColorsConfigurationSchema = z.object({
    accentPrimary: ColorConfigSchema.optional(),
    background: ColorConfigSchema.optional(),
    border: ColorConfigSchema.optional(),
    sidebarBackground: ColorConfigSchema.optional(),
    headerBackground: ColorConfigSchema.optional(),
    cardBackground: ColorConfigSchema.optional()
});

export type ColorsConfigurationSchema = z.infer<typeof ColorsConfigurationSchema>;
