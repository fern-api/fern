import { z } from "zod";
import { BaseTypeDeclarationSchema } from "./BaseTypeDeclarationSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const UndiscriminatedUnionSchema = BaseTypeDeclarationSchema.extend({
    union: z.array(
        z.union([
            z.string(),
            WithDocsSchema.extend({
                type: z.string()
            })
        ])
    ),
    discriminated: z.literal(false)
});

export type UndiscriminatedUnionSchema = z.infer<typeof UndiscriminatedUnionSchema>;
