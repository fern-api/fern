import { z } from "zod";
import { DeclarationSchema } from "./DeclarationSchema";

// This return type is too crazy to write explicitly!
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function extendTypeReferenceSchema<T extends z.ZodRawShape>(extension: T) {
    return z.union([
        z.string(),
        z
            .strictObject({
                type: z.string(),
            })
            .extend(extension),
    ]);
}

export const TypeReferenceSchema = extendTypeReferenceSchema({});
export type TypeReferenceSchema = z.infer<typeof TypeReferenceSchema>;

export const TypeReferenceDeclarationSchema = extendTypeReferenceSchema(DeclarationSchema.shape);
export type TypeReferenceDeclarationSchema = z.infer<typeof TypeReferenceDeclarationSchema>;

export const TypeReferenceDeclarationWithNameSchema = extendTypeReferenceSchema(
    DeclarationSchema.extend({
        name: z.optional(z.string()),
    }).shape
);
export type TypeReferenceWithDocsAndNameSchema = z.infer<typeof TypeReferenceDeclarationWithNameSchema>;
