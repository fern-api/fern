import { z } from "zod";

export const ModuleConfigSchema = z.object({
    path: z.string(),
    version: z.string().optional(),
    imports: z.record(z.string(), z.string()).optional()
});

export type ModuleConfigSchema = z.infer<typeof ModuleConfigSchema>;
