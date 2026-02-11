import { z } from "zod";

export const CliSchema: z.ZodObject<{ version: z.ZodOptional<z.ZodString> }, z.core.$strip> = z.object({
    version: z.string().optional()
});

export type CliSchema = z.infer<typeof CliSchema>;
