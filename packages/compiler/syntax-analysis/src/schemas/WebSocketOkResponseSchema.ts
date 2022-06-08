import { z } from "zod";
import { TypeDefinitionSchema } from "./TypeDefinitionSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const WebSocketOkResponseSchema = z.union([
    z.string(),
    WithDocsSchema.extend({
        type: z.optional(TypeDefinitionSchema),
    }),
]);

export type WebSocketOkResponseSchema = z.infer<typeof WebSocketOkResponseSchema>;
