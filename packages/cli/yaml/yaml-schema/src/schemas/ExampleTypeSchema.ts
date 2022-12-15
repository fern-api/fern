import { z } from "zod";

export const ExampleTypeSchema = z.any();

export type ExampleTypeSchema = z.infer<typeof ExampleTypeSchema>;
