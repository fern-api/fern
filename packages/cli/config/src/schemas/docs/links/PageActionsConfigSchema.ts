import { z } from "zod";

export const PageActionOptionSchema = z.enum(["edit", "report", "suggest", "feedback"]);

export type PageActionOptionSchema = z.infer<typeof PageActionOptionSchema>;

export const CustomPageActionSchema = z.object({
    icon: z.string().optional(),
    text: z.string(),
    href: z.string()
});

export type CustomPageActionSchema = z.infer<typeof CustomPageActionSchema>;

export const PageActionsConfigSchema = z.object({
    default: z.array(PageActionOptionSchema).optional(),
    options: z.array(z.union([PageActionOptionSchema, CustomPageActionSchema])).optional()
});

export type PageActionsConfigSchema = z.infer<typeof PageActionsConfigSchema>;
