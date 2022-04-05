import { z } from "zod";
import { WithDocsSchema } from "./utils/WithDocsSchema";
import { WebSocketMessageBodySchema } from "./WebSocketMessageBodySchema";
import { WebSocketMessageErrorSchema } from "./WebSocketMessageErrorSchema";
import { WebSocketMessageResponseSchema } from "./WebSocketMessageResponseSchema";

export const WebSocketMessageSchema = z
    .strictObject({
        origin: z.enum(["client", "server"]),
        body: z.optional(WebSocketMessageBodySchema),
        response: z.optional(WebSocketMessageResponseSchema),
        errors: z.optional(z.record(WebSocketMessageErrorSchema)),
    })
    .merge(WithDocsSchema);

export type WebSocketMessageSchema = z.infer<typeof WebSocketMessageSchema>;
