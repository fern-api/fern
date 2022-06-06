import { z } from "zod";
import { EncodableTypeDefinitionSchema } from "./EncodableTypeDefinitionSchema";

export const HttpRequestSchema = EncodableTypeDefinitionSchema;

export type HttpRequestSchema = z.infer<typeof HttpRequestSchema>;
