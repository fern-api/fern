import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const VariableReferenceSchema = WithDocsSchema.extend({
    variable: z.string(),
});

export type VariableReferenceSchema = z.infer<typeof VariableReferenceSchema>;
