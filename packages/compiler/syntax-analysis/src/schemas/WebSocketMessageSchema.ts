import { z } from "zod";
import { WebSocketMessageBodySchema } from "./WebSocketMessageBodySchema";
import { WebSocketMessageResponseSchema } from "./WebSocketMessageResponseSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const WebSocketMessageSchema = z
    .strictObject({
        origin: z.enum(["client", "server"]),
        body: z.optional(WebSocketMessageBodySchema),
        response: z.optional(WebSocketMessageResponseSchema),
    })
    .merge(WithDocsSchema);

export type WebSocketMessageSchema = z.infer<typeof WebSocketMessageSchema>;
