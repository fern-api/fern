import { z } from "zod";
import { ObjectExtendsSchema } from "./ObjectExtendsSchema";
import { ObjectPropertySchema } from "./ObjectPropertySchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const ErrorDeclarationSchema = WithDocsSchema.extend({
    extends: ObjectExtendsSchema.optional(),
    properties: z.record(ObjectPropertySchema).optional(),
    statusCode: z.number().optional(),
});

export type ErrorDeclarationSchema = z.infer<typeof ErrorDeclarationSchema>;
