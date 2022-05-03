import { z } from "zod";
import { ObjectPropertySchema } from "./ObjectPropertySchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const ObjectSchema = z
    .strictObject({
        extends: z.optional(z.union([z.string(), z.array(z.string())])),
        properties: z.record(ObjectPropertySchema),
    })
    .merge(WithDocsSchema);

export type ObjectSchema = z.infer<typeof ObjectSchema>;
