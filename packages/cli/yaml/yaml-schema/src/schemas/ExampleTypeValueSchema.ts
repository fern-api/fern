import { z } from "zod";

export const ExampleTypeValueSchema = z.any();

export type ExampleTypeValueSchema = z.infer<typeof ExampleTypeValueSchema>;
