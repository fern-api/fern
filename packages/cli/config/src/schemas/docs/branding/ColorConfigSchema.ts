import { z } from "zod";

export const ColorThemedConfigSchema = z.object({
    dark: z.string().optional(),
    light: z.string().optional()
});

export type ColorThemedConfigSchema = z.infer<typeof ColorThemedConfigSchema>;

export const ColorConfigSchema = z.union([z.string(), ColorThemedConfigSchema]);

export type ColorConfigSchema = z.infer<typeof ColorConfigSchema>;
