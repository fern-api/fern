import { z } from "zod";
import { ResponseErrorsSchema } from "./ResponseErrorsSchema";
import { TypeDefinitionSchema } from "./TypeDefinitionSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const WebSocketMessageResponseSchema = z.union([
    z.string(),
    WithDocsSchema.extend({
        encoding: z.optional(z.string()),
        ok: TypeDefinitionSchema,
        errors: ResponseErrorsSchema,
    }),
]);

export type WebSocketMessageResponseSchema = z.infer<typeof WebSocketMessageResponseSchema>;
