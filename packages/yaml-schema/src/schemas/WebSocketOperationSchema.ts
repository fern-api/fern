import { z } from "zod";
import { ResponseErrorsSchema } from "./ResponseErrorsSchema";
import { WebSocketRequestSchema } from "./WebSocketRequestSchema";
import { WebSocketResponseSchema } from "./WebSocketResponseSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const WebSocketOperationSchema = WithDocsSchema.extend({
    name: z.optional(z.string()),
    request: z.optional(WebSocketRequestSchema),
    response: z.optional(WebSocketResponseSchema),
    errors: z.optional(ResponseErrorsSchema),
});

export type WebSocketOperationSchema = z.infer<typeof WebSocketOperationSchema>;
