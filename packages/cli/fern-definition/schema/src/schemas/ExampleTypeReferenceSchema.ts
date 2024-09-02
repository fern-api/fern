import { z } from "zod";

export const ExampleTypeReferenceSchema = z.unknown();

export type ExampleTypeReferenceSchema = z.infer<typeof ExampleTypeReferenceSchema>;
