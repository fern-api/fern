import { z } from "zod";
import { TypeDeclarationSchema } from "./TypeDeclarationSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const HttpRequestSchema = z.union([
    z.string(),
    WithDocsSchema.extend({
        encoding: z.optional(z.string()),
        type: z.optional(TypeDeclarationSchema),
    }),
]);

export type HttpRequestSchema = z.infer<typeof HttpRequestSchema>;
