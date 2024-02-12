import { z } from "zod";
import { ObjectPropertySchema } from "./ObjectPropertySchema";
import { WithNameSchema } from "./WithNameSchema";

const FileUploadRequestPropertySchema = z.union([
    z.strictObject({
        key: WithNameSchema,
        isOptional: z.boolean()
    }),
    ObjectPropertySchema
]);

export const HttpFileRequestBodySchema = z.strictObject({
    properties: z.optional(z.record(FileUploadRequestPropertySchema))
});

export type HttpFileRequestBodySchema = z.infer<typeof HttpFileRequestBodySchema>;
