import { z } from "zod";
import { ObjectExtendsSchema } from "./ObjectExtendsSchema";
import { ObjectPropertySchema } from "./ObjectPropertySchema";
import { WithDocsSchema } from "./WithDocsSchema";

// for Object schemas, you need either extends/properties (or both).
export const ObjectSchema = z.union([
    WithDocsSchema.extend({
        extends: ObjectExtendsSchema,
        properties: z.optional(z.record(ObjectPropertySchema)),
    }),
    WithDocsSchema.extend({
        extends: z.optional(ObjectExtendsSchema),
        properties: z.record(ObjectPropertySchema),
    }),
]);

export type ObjectSchema = z.infer<typeof ObjectSchema>;
