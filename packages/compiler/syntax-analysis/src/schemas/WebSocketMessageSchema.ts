import { z } from "zod";
import { ResponseErrorsSchema } from "./ResponseErrorsSchema";
import { WebSocketMessageBodySchema } from "./WebSocketMessageBodySchema";
import { WebSocketMessageResponseSchema } from "./WebSocketMessageResponseSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const WebSocketMessageSchema = z
    .strictObject({
        origin: z.enum(["client", "server"]),
        body: z.optional(WebSocketMessageBodySchema),
        response: z.optional(WebSocketMessageResponseSchema),
        errors: z.optional(ResponseErrorsSchema),
    })
    .merge(WithDocsSchema);

export type WebSocketMessageSchema = z.infer<typeof WebSocketMessageSchema>;
