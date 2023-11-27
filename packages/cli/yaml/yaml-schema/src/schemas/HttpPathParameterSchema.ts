import { z } from "zod";
import { TypeReferenceWithDocsSchema } from "./TypeReferenceSchema";
import { VariableReferenceSchema } from "./VariableReferenceSchema";

export const HttpPathParameterSchema = z.union([
    TypeReferenceWithDocsSchema,
    // pathParam: $myVariable
    z.string(),
    VariableReferenceSchema
]);

export type HttpPathParameterSchema = z.infer<typeof HttpPathParameterSchema>;
