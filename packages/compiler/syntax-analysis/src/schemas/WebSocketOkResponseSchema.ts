import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const WebSocketOkResponseSchema = z.union([
    z.string(),
    WithDocsSchema.extend({
        type: z.optional(z.string()),
    }),
]);

export type WebSocketOkResponseSchema = z.infer<typeof WebSocketOkResponseSchema>;
