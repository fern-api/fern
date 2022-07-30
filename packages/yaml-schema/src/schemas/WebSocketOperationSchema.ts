import { z } from "zod";
import { ResponseErrorsSchema } from "./ResponseErrorsSchema";
import { WebSocketRequestSchema } from "./WebSocketRequestSchema";
import { WebSocketResponseSchema } from "./WebSocketResponseSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const WebSocketOperationSchema = WithDocsSchema.extend({
    request: WebSocketRequestSchema.optional(),
    response: WebSocketResponseSchema.optional(),
    errors: ResponseErrorsSchema.optional(),
});

export type WebSocketOperationSchema = z.infer<typeof WebSocketOperationSchema>;
