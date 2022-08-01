import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const WebSocketRequestSchema = z.union([
    z.string(),
    WithDocsSchema.extend({
        type: z.string(),
        encoding: z.optional(z.string()),
    }),
]);

export type WebSocketRequestSchema = z.infer<typeof WebSocketRequestSchema>;
