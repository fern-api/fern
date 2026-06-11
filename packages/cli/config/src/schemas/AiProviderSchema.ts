import { z } from "zod";

export const AiProviderSchema = z.enum(["openai", "anthropic", "aws-bedrock"]);

export type AiProviderSchema = z.infer<typeof AiProviderSchema>;
