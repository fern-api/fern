import { z } from "zod";

export const ModelCustomConfigSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}> = z.object({});

export type ModelCustomConfigSchema = z.infer<typeof ModelCustomConfigSchema>;
