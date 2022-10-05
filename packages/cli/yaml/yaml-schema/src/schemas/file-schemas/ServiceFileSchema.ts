import { z } from "zod";
import { ErrorDeclarationSchema } from "../ErrorDeclarationSchema";
import { ServicesSchema } from "../ServicesSchema";
import { TypeDeclarationSchema } from "../TypeDeclarationSchema";

export const ServiceFileSchema = z.strictObject({
    imports: z.optional(z.record(z.string())),
    types: z.optional(z.record(TypeDeclarationSchema)),
    services: z.optional(ServicesSchema),
    errors: z.optional(z.record(ErrorDeclarationSchema)),
});

export type ServiceFileSchema = z.infer<typeof ServiceFileSchema>;
