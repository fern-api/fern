import { z } from "zod";
import { ResponseErrorsSchema } from "./ResponseErrorsSchema";
import { TypeDefinitionSchema } from "./TypeDefinitionSchema";
import { WebSocketMessageResponseBehaviorSchema } from "./WebSocketMessageResponseBehaviorSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const WebSocketMessageResponseSchema = z.union([
    z.string(),
    WithDocsSchema.extend({
        behavior: z.optional(WebSocketMessageResponseBehaviorSchema),
        encoding: z.optional(z.string()),
        ok: z.union([z.string(), TypeDefinitionSchema]),
        errors: ResponseErrorsSchema,
    }),
]);

export type WebSocketMessageResponseSchema = z.infer<typeof WebSocketMessageResponseSchema>;
