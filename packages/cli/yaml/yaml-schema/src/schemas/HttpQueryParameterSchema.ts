import { z } from "zod";
import { DeclarationWithNameSchema } from "./DeclarationWithNameSchema";
import { extendTypeReferenceSchema } from "./TypeReferenceSchema";

export const HttpQueryParameterSchema = extendTypeReferenceSchema(
    DeclarationWithNameSchema.extend({
        "allow-multiple": z.optional(z.boolean()),
        "query-parameter-representation": z.optional(z.enum(["EXPLODED", "COMMA_SEPARATED"]))
    }).shape
);

export type HttpQueryParameterSchema = z.infer<typeof HttpQueryParameterSchema>;
