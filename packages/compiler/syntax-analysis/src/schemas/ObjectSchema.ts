import { z } from "zod";
import { ObjectFieldSchema } from "./ObjectFieldSchema";
import { WithDocsSchema } from "./utils/WithDocsSchema";

export const ObjectSchema = z
    .strictObject({
        extends: z.optional(z.union([z.string(), z.array(z.string())])),
        fields: z.record(ObjectFieldSchema),
    })
    .merge(WithDocsSchema);

export type ObjectSchema = z.infer<typeof ObjectSchema>;
