import { z } from "zod";
import { TypeDefinitionSchema } from "./TypeDefinitionSchema";

export const HttpRequestSchema = TypeDefinitionSchema;

export type HttpRequestSchema = z.infer<typeof HttpRequestSchema>;
