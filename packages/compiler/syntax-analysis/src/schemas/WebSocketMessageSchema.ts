import { z } from "zod";
import { WebSocketMessageResponseSchema } from "./WebSocketMessageResponseSchema";
import { WebSocketRequestSchema } from "./WebSocketRequestSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const WebSocketMessageSchema = z
    .strictObject({
        request: z.optional(WebSocketRequestSchema),
        response: z.optional(WebSocketMessageResponseSchema),
    })
    .merge(WithDocsSchema);

export type WebSocketMessageSchema = z.infer<typeof WebSocketMessageSchema>;
