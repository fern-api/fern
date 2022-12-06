import { z } from "zod";

export const TypeExampleSchema = z.any();

export type TypeExampleSchema = z.infer<typeof TypeExampleSchema>;
