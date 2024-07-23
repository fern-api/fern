import { z } from "zod";
import { TypeReferenceWithDocsAndAvailabilitySchema } from "./TypeReferenceSchema";
import { VariableReferenceSchema } from "./VariableReferenceSchema";

export const HttpPathParameterSchema = z.union([
    TypeReferenceWithDocsAndAvailabilitySchema,
    // pathParam: $myVariable
    z.string(),
    VariableReferenceSchema
]);

export type HttpPathParameterSchema = z.infer<typeof HttpPathParameterSchema>;
