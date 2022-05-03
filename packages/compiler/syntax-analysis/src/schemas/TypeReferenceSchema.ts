import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

// This return type is too crazy to write explicitly!
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function extendTypeReferenceSchema<T extends z.ZodRawShape>(extension: T) {
    return z.union([
        z.string(),
        z
            .strictObject({
                type: z.optional(z.string()),
            })
            .extend(extension),
    ]);
}

export const TypeReferenceSchema = extendTypeReferenceSchema({});
export type TypeReferenceSchema = z.infer<typeof TypeReferenceSchema>;

export const TypeReferenceWithDocsSchema = extendTypeReferenceSchema(WithDocsSchema.shape);
export type TypeReferenceWithDocsSchema = z.infer<typeof TypeReferenceWithDocsSchema>;
