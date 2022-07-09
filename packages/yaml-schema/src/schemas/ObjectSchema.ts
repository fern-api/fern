import { z } from "zod";
import { ObjectPropertySchema } from "./ObjectPropertySchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const ObjectSchema = WithDocsSchema.extend({
    extends: z.optional(z.union([z.string(), z.array(z.string())])),
    properties: z.record(ObjectPropertySchema),
});

export type ObjectSchema = z.infer<typeof ObjectSchema>;
