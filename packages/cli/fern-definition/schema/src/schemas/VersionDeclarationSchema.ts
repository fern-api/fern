import { z } from "zod";
import { EnumValueSchema } from "./EnumValueSchema";
import { VersionDeclarationHeaderSchema } from "./VersionDeclarationHeaderSchema";

export const VersionDeclarationSchema = z.strictObject({
    header: z.union([z.string(), VersionDeclarationHeaderSchema]),
    default: z.string().optional(),
    values: z.array(z.union([z.string(), EnumValueSchema]))
});

export type VersionDeclarationSchema = z.infer<typeof VersionDeclarationSchema>;
