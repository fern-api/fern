import { z } from "zod";
import { ErrorReferenceSchema } from "./ErrorReferenceSchema";
import { WithDocsSchema } from "./utils/WithDocsSchema";
import { WebSocketMessageBodySchema } from "./WebSocketMessageBodySchema";
import { WebSocketMessageResponseSchema } from "./WebSocketMessageResponseSchema";

export const WebSocketMessageSchema = z
    .strictObject({
        origin: z.enum(["client", "server"]),
        body: z.optional(WebSocketMessageBodySchema),
        response: z.optional(WebSocketMessageResponseSchema),
        errors: z.array(ErrorReferenceSchema),
    })
    .merge(WithDocsSchema);

export type WebSocketMessageSchema = z.infer<typeof WebSocketMessageSchema>;
