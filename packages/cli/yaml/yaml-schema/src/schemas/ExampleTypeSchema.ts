import { z } from "zod";
import { ExampleTypeValueSchema } from "./ExampleTypeValueSchema";
import { WithNameAndDocsSchema } from "./WithNameAndDocsSchema";

export const ExampleTypeSchema = WithNameAndDocsSchema.extend({
    value: ExampleTypeValueSchema
});

export type ExampleTypeSchema = z.infer<typeof ExampleTypeSchema>;
