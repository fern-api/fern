import { z } from "zod";
import { BaseTypeDeclarationSchema } from "./BaseTypeDeclarationSchema";
import { ObjectExtendsSchema } from "./ObjectExtendsSchema";
import { ObjectPropertySchema } from "./ObjectPropertySchema";
import { TypeReferenceDeclarationSchema } from "./TypeReferenceSchema";

// for Object schemas, you need either extends/properties (or both).
export const ObjectSchema = z.union([
    BaseTypeDeclarationSchema.extend({
        extensions: z.optional(z.record(z.string(), z.any())),
        extends: ObjectExtendsSchema,
        properties: z.optional(z.record(ObjectPropertySchema)),
        ["extra-properties"]: z.optional(z.union([z.boolean(), TypeReferenceDeclarationSchema]))
    }),
    BaseTypeDeclarationSchema.extend({
        extensions: z.optional(z.record(z.string(), z.any())),
        extends: z.optional(ObjectExtendsSchema),
        properties: z.record(ObjectPropertySchema),
        ["extra-properties"]: z.optional(z.union([z.boolean(), TypeReferenceDeclarationSchema]))
    })
]);

export type ObjectSchema = z.infer<typeof ObjectSchema>;
