import { z } from "zod";

export const LogoConfigurationSchema = z.object({
    dark: z.string().optional(),
    light: z.string().optional(),
    height: z.number().optional(),
    href: z.string().optional(),
    rightText: z.string().optional()
});

export type LogoConfigurationSchema = z.infer<typeof LogoConfigurationSchema>;
