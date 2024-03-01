import { z } from "zod";
import { GeneratorsOpenAPIObjectSchema } from "./GeneratorsOpenAPIObjectSchema";

export const GeneratorsOpenAPISchema = z.union([GeneratorsOpenAPIObjectSchema, z.string()]);

export type GeneratorsOpenAPISchema = z.infer<typeof GeneratorsOpenAPISchema>;
