import { z } from "zod";
import { DeclarationSchema } from "./DeclarationSchema";
import { DeclarationWithNameSchema } from "./DeclarationWithNameSchema";
import { EncodingSchema } from "./EncodingSchema";
import { ValidationSchema } from "./ValidationSchema";
import { WithAvailabilitySchema } from "./WithAvailabilitySchema";
import { WithDocsSchema } from "./WithDocsSchema";

// This return type is too crazy to write explicitly!
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function extendTypeReferenceSchema<T extends z.ZodRawShape>(extension: T) {
    return z.union([
        z.string(),
        z
            .strictObject({
                type: z.string(),
                default: z.unknown().optional(),
                encoding: z.optional(EncodingSchema),
                validation: z.optional(ValidationSchema)
            })
            .extend(WithAvailabilitySchema.shape)
            .extend(WithDocsSchema.shape)
            .extend(extension)
    ]);
}

export const TypeReferenceSchema = extendTypeReferenceSchema(z.object({}).shape);
export type TypeReferenceSchema = z.infer<typeof TypeReferenceSchema>;

export const TypeReferenceDeclarationSchema = extendTypeReferenceSchema(DeclarationSchema.shape);
export type TypeReferenceDeclarationSchema = z.infer<typeof TypeReferenceDeclarationSchema>;

export const TypeReferenceDeclarationWithNameSchema = extendTypeReferenceSchema(DeclarationWithNameSchema.shape);
export type TypeReferenceWithDocsAndNameSchema = z.infer<typeof TypeReferenceDeclarationWithNameSchema>;

export const TypeReferenceDeclarationWithEnvOverride = extendTypeReferenceSchema(
    DeclarationWithNameSchema.extend({
        env: z.optional(z.string())
    }).shape
);
export type TypeReferenceDeclarationWithEnvOverride = z.infer<typeof TypeReferenceDeclarationWithEnvOverride>;
