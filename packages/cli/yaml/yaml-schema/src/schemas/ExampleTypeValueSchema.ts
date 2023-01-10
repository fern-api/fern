import { z } from "zod";

export const ExampleTypeValueSchema = z.unknown();

export type ExampleTypeValueSchema = z.infer<typeof ExampleTypeValueSchema>;
