import { z } from "zod";
import { BaseTypeDeclarationSchema } from "./BaseTypeDeclarationSchema";
import { ObjectExtendsSchema } from "./ObjectExtendsSchema";
import { ObjectPropertySchema } from "./ObjectPropertySchema";

// for Object schemas, you need either extends/properties (or both).
export const ObjectSchema = z.union([
    BaseTypeDeclarationSchema.extend({
        extensions: z.optional(z.record(z.string(), z.any())),
        extends: ObjectExtendsSchema,
        properties: z.optional(z.record(ObjectPropertySchema)),
    }),
    BaseTypeDeclarationSchema.extend({
        extensions: z.optional(z.record(z.string(), z.any())),
        extends: z.optional(ObjectExtendsSchema),
        properties: z.record(ObjectPropertySchema),
    }),
]);

export type ObjectSchema = z.infer<typeof ObjectSchema>;
