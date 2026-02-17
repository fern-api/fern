import { z } from "zod";

export const PlaygroundButtonSettingsSchema = z.object({
    href: z.string().optional()
});

export type PlaygroundButtonSettingsSchema = z.infer<typeof PlaygroundButtonSettingsSchema>;

export const PlaygroundSettingsSchema = z.object({
    oauth: z.boolean().optional(),
    button: PlaygroundButtonSettingsSchema.optional()
});

export type PlaygroundSettingsSchema = z.infer<typeof PlaygroundSettingsSchema>;
