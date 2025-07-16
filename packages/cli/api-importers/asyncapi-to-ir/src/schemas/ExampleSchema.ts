import { z } from 'zod'

export const WebsocketSessionExampleMessageSchema = z.object({
    type: z.string(),
    channelId: z.string().optional(),
    messageId: z.string(),
    value: z.any()
})

export const WebsocketSessionExtensionExampleSchema = z.object({
    summary: z.string().optional(),
    description: z.string().optional(),
    'query-parameters': z.record(z.string()).optional(),
    headers: z.record(z.string()).optional(),
    messages: z.array(WebsocketSessionExampleMessageSchema)
})

export const WebsocketSessionExtensionExamplesSchema = z.array(WebsocketSessionExtensionExampleSchema)
