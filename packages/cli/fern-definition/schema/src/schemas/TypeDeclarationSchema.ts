import { z } from "zod";
import { AliasSchema } from "./AliasSchema";
import { DiscriminatedUnionSchema } from "./DiscriminatedUnionSchema";
import { EnumSchema } from "./EnumSchema";
import { ObjectSchema } from "./ObjectSchema";
import { UndiscriminatedUnionSchema } from "./UndiscriminatedUnionSchema";

export const TypeDeclarationSchema = z.union([
    z.string(),
    ObjectSchema,
    DiscriminatedUnionSchema,
    AliasSchema,
    EnumSchema,
    UndiscriminatedUnionSchema
]);

export type TypeDeclarationSchema = z.infer<typeof TypeDeclarationSchema>;
