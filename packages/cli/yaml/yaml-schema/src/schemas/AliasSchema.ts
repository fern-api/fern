import { z } from "zod";
import { BaseTypeDeclarationSchema } from "./BaseTypeDeclarationSchema";
import { ValidationSchema } from "./ValidationSchema";

export const AliasSchema = BaseTypeDeclarationSchema.extend(
    z.strictObject({
        type: z.string(),
        validation: z.optional(ValidationSchema)
    }).shape
);

export type AliasSchema = z.infer<typeof AliasSchema>;
