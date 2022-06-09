import { z } from "zod";
import { WebSocketOperationSchema } from "./WebSocketOperationSchema";

export const WebSocketMessengerSchema = z.strictObject({
    operations: z.optional(z.record(WebSocketOperationSchema)),
});

export type WebSocketMessengerSchema = z.infer<typeof WebSocketMessengerSchema>;
