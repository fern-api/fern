import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const WebSocketResponseSchema = z.union([
    z.string(),
    WithDocsSchema.extend({
        type: z.string(),
    }),
]);

export type WebSocketResponseSchema = z.infer<typeof WebSocketResponseSchema>;
