import { z } from "zod";
import { OpenAPISourceSchema } from "./OpenAPISourceSchema";
import { ProtobufSourceSchema } from "./ProtobufSourceSchema";

export const SourceSchema = z.union([ProtobufSourceSchema, OpenAPISourceSchema]);

export type SourceSchema = z.infer<typeof SourceSchema>;
