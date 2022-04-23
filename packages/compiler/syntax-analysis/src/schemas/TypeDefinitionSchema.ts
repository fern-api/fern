import { z } from "zod";
import { AliasSchema } from "./AliasSchema";
import { EnumSchema } from "./EnumSchema";
import { ObjectSchema } from "./ObjectSchema";
import { UnionSchema } from "./UnionSchema";

// This return type is too crazy to write explicitly!
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function extendTypeDefinitionSchema<T extends z.ZodRawShape>(extension: T) {
    return z.union([
        ObjectSchema.extend(extension),
        UnionSchema.extend(extension),
        AliasSchema.extend(extension),
        EnumSchema.extend(extension),
    ]);
}

export const TypeDefinitionSchema = extendTypeDefinitionSchema({});

export type TypeDefinitionSchema = z.infer<typeof TypeDefinitionSchema>;
