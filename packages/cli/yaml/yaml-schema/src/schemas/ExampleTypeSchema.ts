import { z } from "zod";
import { ExampleTypeValueSchema } from "./ExampleTypeValueSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const ExampleTypeSchema = WithDocsSchema.extend({
    name: z.optional(z.string()),
    value: ExampleTypeValueSchema,
});

export type ExampleTypeSchema = z.infer<typeof ExampleTypeSchema>;
