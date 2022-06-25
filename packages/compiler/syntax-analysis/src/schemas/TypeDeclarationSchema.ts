import { z } from "zod";
import { AliasSchema } from "./AliasSchema";
import { EnumSchema } from "./EnumSchema";
import { ObjectSchema } from "./ObjectSchema";
import { UnionSchema } from "./UnionSchema";

export const TypeDeclarationSchema = z.union([z.string(), ObjectSchema, UnionSchema, AliasSchema, EnumSchema]);

export type TypeDeclarationSchema = z.infer<typeof TypeDeclarationSchema>;
