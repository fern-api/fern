import { z } from "zod";

export const AiProviderSchema = z.enum(["openai", "anthropic", "bedrock"]);

export type AiProviderSchema = z.infer<typeof AiProviderSchema>;
