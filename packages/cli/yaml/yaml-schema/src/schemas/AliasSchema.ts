import { z } from "zod";
import { BaseTypeDeclarationSchema } from "./BaseTypeDeclarationSchema";

export const AliasSchema = BaseTypeDeclarationSchema.extend({
    type: z.string()
});

export type AliasSchema = z.infer<typeof AliasSchema>;
