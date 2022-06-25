import { z } from "zod";
import { TypeDeclarationSchema } from "./TypeDeclarationSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const WebSocketRequestSchema = z.union([
    z.string(),
    WithDocsSchema.extend({
        type: z.optional(TypeDeclarationSchema),
        encoding: z.optional(z.string()),
    }),
]);

export type WebSocketRequestSchema = z.infer<typeof WebSocketRequestSchema>;
