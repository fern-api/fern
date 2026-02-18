import { z } from "zod";
import { FontConfigSchema } from "./FontConfigSchema.js";

export const TypographyConfigSchema = z.object({
    headingsFont: FontConfigSchema.optional(),
    bodyFont: FontConfigSchema.optional(),
    codeFont: FontConfigSchema.optional()
});

export type TypographyConfigSchema = z.infer<typeof TypographyConfigSchema>;
