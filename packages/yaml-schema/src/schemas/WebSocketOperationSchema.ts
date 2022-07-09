import { z } from "zod";
import { WebSocketRequestSchema } from "./WebSocketRequestSchema";
import { WebSocketResponseSchema } from "./WebSocketResponseSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const WebSocketOperationSchema = WithDocsSchema.extend({
    request: z.optional(WebSocketRequestSchema),
    response: z.optional(WebSocketResponseSchema),
});

export type WebSocketOperationSchema = z.infer<typeof WebSocketOperationSchema>;
