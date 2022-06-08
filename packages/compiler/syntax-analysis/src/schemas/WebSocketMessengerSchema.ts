import { z } from "zod";
import { WebSocketOperationSchema } from "./WebSocketOperationSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const WebSocketMessengerSchema = z
    .strictObject({
        operations: z.optional(z.record(WebSocketOperationSchema)),
    })
    .merge(WithDocsSchema);

export type WebSocketMessengerSchema = z.infer<typeof WebSocketMessengerSchema>;
