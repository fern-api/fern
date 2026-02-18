import { z } from "zod";

export const FontConfigVariantSchema = z.object({
    path: z.string(),
    weight: z.union([z.string(), z.number()]).optional(),
    style: z.enum(["normal", "italic"]).optional()
});

export type FontConfigVariantSchema = z.infer<typeof FontConfigVariantSchema>;

export const FontConfigSchema = z.object({
    name: z.string().optional(),
    path: z.string().optional(),
    paths: z.array(z.union([z.string(), FontConfigVariantSchema])).optional(),
    weight: z.union([z.string(), z.number()]).optional(),
    style: z.enum(["normal", "italic"]).optional(),
    display: z.enum(["auto", "block", "swap", "fallback", "optional"]).optional(),
    fallback: z.array(z.string()).optional(),
    fontVariationSettings: z.string().optional()
});

export type FontConfigSchema = z.infer<typeof FontConfigSchema>;
