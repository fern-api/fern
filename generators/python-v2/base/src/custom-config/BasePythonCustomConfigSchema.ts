import { z } from "zod";

export const BasePythonCustomConfigSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}> = z.object({});

export type BasePythonCustomConfigSchema = z.infer<typeof BasePythonCustomConfigSchema>;
