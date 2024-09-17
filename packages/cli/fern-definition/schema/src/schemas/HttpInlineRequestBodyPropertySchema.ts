import { z } from "zod";
import { DeclarationWithNameSchema } from "./DeclarationWithNameSchema";
import { extendTypeReferenceSchema } from "./TypeReferenceSchema";

export const HttpInlineRequestBodyPropertySchema = extendTypeReferenceSchema(
    DeclarationWithNameSchema.extend({
        // For multipart form uploads
        ["content-type"]: z.string().optional()
    }).shape
);

export type HttpInlineRequestBodyPropertySchema = z.infer<typeof HttpInlineRequestBodyPropertySchema>;
