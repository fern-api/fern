import { z } from "zod";
import { TypeDefinitionSchema } from "./TypeDefinitionSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const WebSocketInitSchema = z.union([
    z.string(),
    WithDocsSchema.extend({
        type: TypeDefinitionSchema,
        encoding: z.string(),
    }),
]);

export type WebSocketInitSchema = z.infer<typeof WebSocketInitSchema>;
