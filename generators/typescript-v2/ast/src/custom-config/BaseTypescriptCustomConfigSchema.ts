import { z } from "zod";

export const BaseTypescriptCustomConfigSchema = z.object({});

export type BaseTypescriptCustomConfigSchema = z.infer<typeof BaseTypescriptCustomConfigSchema>;
