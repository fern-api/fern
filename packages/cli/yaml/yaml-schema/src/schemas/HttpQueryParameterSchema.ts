import { z } from "zod";
import { DeclarationWithNameSchema } from "./DeclarationWithNameSchema";
import { extendTypeReferenceSchema } from "./TypeReferenceSchema";

export const HttpQueryParameterSchema = extendTypeReferenceSchema(
    DeclarationWithNameSchema.extend({
        "allow-multiple": z.optional(
            z.union([
                z.boolean(),
                z.strictObject({
                    encoding: z.enum(["exploded", "comma_delimited", "space_delimited", "pipe_delimited"])
                })
            ])
        )
    }).shape
);

export type HttpQueryParameterSchema = z.infer<typeof HttpQueryParameterSchema>;
