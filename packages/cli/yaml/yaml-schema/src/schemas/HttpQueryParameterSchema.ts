import { z } from "zod";
import { DeclarationWithNameSchema } from "./DeclarationWithNameSchema";
import { extendTypeReferenceSchema } from "./TypeReferenceSchema";

export const HttpQueryParameterSchema = extendTypeReferenceSchema(
    DeclarationWithNameSchema.extend({
        "allow-multiple": z.optional(z.boolean())
    }).shape
);

export type HttpQueryParameterSchema = z.infer<typeof HttpQueryParameterSchema>;
