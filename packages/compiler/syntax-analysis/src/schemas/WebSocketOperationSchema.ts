import { z } from "zod";
import { WebSocketRequestSchema } from "./WebSocketRequestSchema";
import { WebSocketResponseSchema } from "./WebSocketResponseSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const WebSocketOperationSchema = z
    .strictObject({
        request: z.optional(WebSocketRequestSchema),
        response: z.optional(WebSocketResponseSchema),
    })
    .merge(WithDocsSchema);

export type WebSocketOperationSchema = z.infer<typeof WebSocketOperationSchema>;
