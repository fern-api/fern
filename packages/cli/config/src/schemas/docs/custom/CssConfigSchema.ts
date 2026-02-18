import { z } from "zod";

export const CssConfigSchema = z.union([z.string(), z.array(z.string())]);

export type CssConfigSchema = z.infer<typeof CssConfigSchema>;
