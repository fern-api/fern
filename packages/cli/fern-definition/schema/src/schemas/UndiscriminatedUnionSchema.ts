import { z } from "zod";
import { BaseTypeDeclarationSchema } from "./BaseTypeDeclarationSchema";
import { WithDisplayNameSchema } from "./WithDisplayNameSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const UndiscriminatedUnionSchema = BaseTypeDeclarationSchema.extend({
    union: z.array(
        z.union([
            z.string(),
            z
                .object({
                    type: z.string()
                })
                .extend(WithDocsSchema.shape)
                .extend(WithDisplayNameSchema.shape)
        ])
    ),
    discriminated: z.literal(false)
});

export type UndiscriminatedUnionSchema = z.infer<typeof UndiscriminatedUnionSchema>;
