import { z } from "zod";
import { ErrorDeclarationSchema } from "../ErrorDeclarationSchema";
import { HttpServiceSchema } from "../HttpServiceSchema";
import { TypeDeclarationSchema } from "../TypeDeclarationSchema";

export const DefinitionFileSchema = z.strictObject({
    docs: z.optional(z.string()),
    imports: z.optional(z.record(z.string())),
    types: z.optional(z.record(TypeDeclarationSchema)),
    service: z.optional(HttpServiceSchema),
    errors: z.optional(z.record(ErrorDeclarationSchema)),
});

export type DefinitionFileSchema = z.infer<typeof DefinitionFileSchema>;
