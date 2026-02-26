import { z } from "zod";
import { OutputObjectSchema } from "./OutputObjectSchema.js";

export const OutputSchema = z.union([z.string(), OutputObjectSchema]);

export type OutputSchema = z.infer<typeof OutputSchema>;
