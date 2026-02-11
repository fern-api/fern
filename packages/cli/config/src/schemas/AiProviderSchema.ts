import { z } from "zod";

export const AiProviderSchema: z.ZodEnum<{ openai: "openai"; anthropic: "anthropic"; bedrock: "bedrock" }> = z.enum([
    "openai",
    "anthropic",
    "bedrock"
]);

export type AiProviderSchema = z.infer<typeof AiProviderSchema>;
