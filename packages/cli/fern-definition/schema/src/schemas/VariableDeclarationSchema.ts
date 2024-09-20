import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const VariableDeclarationSchema = z.union([
    z.string(),
    z
        .strictObject({
            type: z.string()
        })
        .extend(WithDocsSchema.shape)
]);

export type VariableDeclarationSchema = z.infer<typeof VariableDeclarationSchema>;
