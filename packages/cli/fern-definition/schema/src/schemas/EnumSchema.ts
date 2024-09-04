import { z } from "zod";
import { BaseTypeDeclarationSchema } from "./BaseTypeDeclarationSchema";
import { EnumValueSchema } from "./EnumValueSchema";

export const EnumSchema = BaseTypeDeclarationSchema.extend({
    default: z.string().optional(),
    enum: z.array(z.union([z.string(), EnumValueSchema]))
});

export type EnumSchema = z.infer<typeof EnumSchema>;
