import { z } from "zod";
import { TypeDeclarationSchema } from "./TypeDeclarationSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const HttpOkResponseSchema = z.union([
    z.string(),
    WithDocsSchema.extend({
        type: z.optional(TypeDeclarationSchema),
    }),
]);

export type HttpOkResponseSchema = z.infer<typeof HttpOkResponseSchema>;
