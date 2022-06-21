import { z } from "zod";
import { FailedResponseSchema } from "./FailedResponseSchema";
import { WebSocketOkResponseSchema } from "./WebSocketOkResponseSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const WebSocketResponseSchema = WithDocsSchema.extend({
    encoding: z.optional(z.string()),
    ok: z.optional(WebSocketOkResponseSchema),
    failed: z.optional(FailedResponseSchema),
});

export type WebSocketResponseSchema = z.infer<typeof WebSocketResponseSchema>;
