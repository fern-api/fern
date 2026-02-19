import { z } from "zod";

export const AiExamplesConfigSchema = z.object({
    enabled: z.boolean().optional()
});

export type AiExamplesConfigSchema = z.infer<typeof AiExamplesConfigSchema>;
