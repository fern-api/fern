import { z } from "zod";

export const ModuleConfigSchema = z.object({});

export type ModuleConfigSchema = z.infer<typeof ModuleConfigSchema>;
