import { z } from "zod";
import { AiProviderSchema } from "./AiProviderSchema";

export const AiConfigSchema = z.object({
    provider: AiProviderSchema,
    model: z.string()
});

export type AiConfigSchema = z.infer<typeof AiConfigSchema>;
