import { z } from "zod";
import { DeclarationSchema } from "./DeclarationSchema";
import { DeclarationWithNameSchema } from "./DeclarationWithNameSchema";
import { ValidationSchema } from "./ValidationSchema";
import { WithDocsAndAvailabilitySchema } from "./WithDocsAndAvailability";
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
                validation: z.optional(ValidationSchema)
            })
            .extend(extension)
    ]);
}

export const TypeReferenceSchema = extendTypeReferenceSchema({});
export type TypeReferenceSchema = z.infer<typeof TypeReferenceSchema>;

export const TypeReferenceWithDocsSchema = extendTypeReferenceSchema(WithDocsSchema.shape);
export type TypeReferenceWithDocsSchema = z.infer<typeof TypeReferenceWithDocsSchema>;

export const TypeReferenceWithDocsAndAvailabilitySchema = extendTypeReferenceSchema(
    WithDocsAndAvailabilitySchema.shape
);
export type TypeReferenceWithDocsAndAvailabilitySchema = z.infer<typeof TypeReferenceWithDocsAndAvailabilitySchema>;

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

export const TypeReferenceWithDefaultAndValidationSchema = z.strictObject({
    type: z.string(),
    default: z.unknown().optional(),
    validation: z.optional(ValidationSchema)
});
export type TypeReferenceWithDefaultAndValidationSchema = z.infer<typeof TypeReferenceWithDefaultAndValidationSchema>;
