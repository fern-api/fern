import { z } from "zod";
import { ResponseErrorsSchema } from "./ResponseErrorsSchema";
import { TypeDefinitionSchema } from "./TypeDefinitionSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const HttpResponseSchema = z.union([
    z.string(),
    WithDocsSchema.extend({
        encoding: z.optional(z.string()),
        ok: z.optional(z.union([z.string(), TypeDefinitionSchema])),
        errors: z.optional(ResponseErrorsSchema),
    }),
]);

export type HttpResponseSchema = z.infer<typeof HttpResponseSchema>;
