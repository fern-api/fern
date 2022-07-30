import { z } from "zod";
import { ErrorDeclarationSchema } from "./ErrorDeclarationSchema";
import { IdSchema } from "./IdSchema";
import { ServicesSchema } from "./ServicesSchema";
import { TypeDeclarationSchema } from "./TypeDeclarationSchema";

export const FernConfigurationSchema = z.strictObject({
    imports: z.record(z.string()).optional(),
    ids: z.array(IdSchema).optional(),
    types: z.record(TypeDeclarationSchema).optional(),
    services: ServicesSchema.optional(),
    errors: z.record(ErrorDeclarationSchema).optional(),
});

export type FernConfigurationSchema = z.infer<typeof FernConfigurationSchema>;
