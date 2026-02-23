import { z } from "zod";

export const AiChatDatasourceSchema = z.object({
    type: z.string().optional(),
    urls: z.array(z.string()).optional()
});

export type AiChatDatasourceSchema = z.infer<typeof AiChatDatasourceSchema>;

export const AiChatConfigSchema = z.object({
    model: z.string().optional(),
    systemPrompt: z.string().optional(),
    location: z.enum(["header", "sidebar", "both"]).optional(),
    datasources: z.array(AiChatDatasourceSchema).optional()
});

export type AiChatConfigSchema = z.infer<typeof AiChatConfigSchema>;
