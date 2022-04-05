import { z } from "zod";
import { inlinableType } from "./utils/inlinableType";
import { WithDocsSchema } from "./utils/WithDocsSchema";
import { WebSocketMessageResponseBehaviorSchema } from "./WebSocketMessageResponseBehaviorSchema";

export const WebSocketMessageResponseSchema = inlinableType(
    WithDocsSchema.extend({
        behavior: z.optional(WebSocketMessageResponseBehaviorSchema),
    }).shape
);

export type WebSocketMessageResponseSchema = z.infer<typeof WebSocketMessageResponseSchema>;
