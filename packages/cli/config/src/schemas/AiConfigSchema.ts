import { z } from "zod";
import { AiProviderSchema } from "./AiProviderSchema";

export const AiConfigSchema: z.ZodObject<
    { provider: z.ZodEnum<{ openai: "openai"; anthropic: "anthropic"; bedrock: "bedrock" }>; model: z.ZodString },
    z.core.$strip
> = z.object({
    provider: AiProviderSchema,
    model: z.string()
});

export type AiConfigSchema = z.infer<typeof AiConfigSchema>;
