import { z } from "zod";
import { TypeDeclarationSchema } from "./TypeDeclarationSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const WebSocketOkResponseSchema = z.union([
    z.string(),
    WithDocsSchema.extend({
        type: z.optional(TypeDeclarationSchema),
    }),
]);

export type WebSocketOkResponseSchema = z.infer<typeof WebSocketOkResponseSchema>;
