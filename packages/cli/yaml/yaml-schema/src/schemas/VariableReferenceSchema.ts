import { z } from "zod";
import { AvailabilityUnionSchema } from "./AvailabilityUnionSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const VariableReferenceSchema = WithDocsSchema.extend({
    variable: z.string(),
    availability: AvailabilityUnionSchema
});

export type VariableReferenceSchema = z.infer<typeof VariableReferenceSchema>;
