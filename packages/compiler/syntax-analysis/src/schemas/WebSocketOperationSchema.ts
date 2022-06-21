import { z } from "zod";
import { WebSocketRequestSchema } from "./WebSocketRequestSchema";
import { WebSocketResponseSchema } from "./WebSocketResponseSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const WebSocketOperationSchema = WithDocsSchema.extend({
    request: z.optional(z.union([z.string(), WebSocketRequestSchema])),
    response: z.optional(z.union([z.string(), WebSocketResponseSchema])),
});

export type WebSocketOperationSchema = z.infer<typeof WebSocketOperationSchema>;
