import { z } from "zod";

export const BackgroundImageThemedConfigSchema = z.object({
    dark: z.string().optional(),
    light: z.string().optional()
});

export type BackgroundImageThemedConfigSchema = z.infer<typeof BackgroundImageThemedConfigSchema>;

export const BackgroundImageConfigurationSchema = z.union([z.string(), BackgroundImageThemedConfigSchema]);

export type BackgroundImageConfigurationSchema = z.infer<typeof BackgroundImageConfigurationSchema>;
