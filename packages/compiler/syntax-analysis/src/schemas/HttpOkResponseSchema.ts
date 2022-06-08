import { z } from "zod";
import { TypeDefinitionSchema } from "./TypeDefinitionSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const HttpOkResponseSchema = z.union([
    z.string(),
    WithDocsSchema.extend({
        type: z.optional(TypeDefinitionSchema),
    }),
]);

export type HttpOkResponseSchema = z.infer<typeof HttpOkResponseSchema>;
