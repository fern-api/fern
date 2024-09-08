import { z } from "zod";

export const BasePhpCustomConfigSchema = z.object({});

export type BasePhpCustomConfigSchema = z.infer<typeof BasePhpCustomConfigSchema>;
