import { z } from "zod";

export const BasePythonCustomConfigSchema = z.object({});

export type BasePythonCustomConfigSchema = z.infer<typeof BasePythonCustomConfigSchema>;
