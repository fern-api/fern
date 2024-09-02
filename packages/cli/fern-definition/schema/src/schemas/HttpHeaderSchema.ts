import { z } from "zod";
import { TypeReferenceDeclarationWithEnvOverride } from "./TypeReferenceSchema";

export const HttpHeaderSchema = TypeReferenceDeclarationWithEnvOverride;

export type HttpHeaderSchema = z.infer<typeof HttpHeaderSchema>;
