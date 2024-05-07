import { z } from "zod";
import { ExampleTypeSchema } from "./ExampleTypeSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const ErrorDeclarationSchema = WithDocsSchema.extend({
    "status-code": z.number(),
    type: z.optional(z.string()),
    examples: z.optional(z.array(ExampleTypeSchema))
});

export type ErrorDeclarationSchema = z.infer<typeof ErrorDeclarationSchema>;
