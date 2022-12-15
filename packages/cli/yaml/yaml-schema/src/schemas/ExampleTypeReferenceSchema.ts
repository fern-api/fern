import { z } from "zod";

export const ExampleTypeReferenceSchema = z.any();

export type ExampleTypeReferenceSchema = z.infer<typeof ExampleTypeReferenceSchema>;
