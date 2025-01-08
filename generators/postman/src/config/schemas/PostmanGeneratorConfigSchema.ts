import { z } from "zod";

import { PublishConfigSchema } from "./PublishConfigSchema";

export const PostmanGeneratorConfigSchema = z.union([
    z.null(),
    z.undefined(),
    z.strictObject({
        publishing: PublishConfigSchema.optional(),
        filename: z.string().optional(),
        "collection-name": z.string().optional()
    })
]);

export type PostmanGeneratorConfigSchema = z.infer<typeof PostmanGeneratorConfigSchema>;
