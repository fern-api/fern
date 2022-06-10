import { z } from "zod";
import { ErrorDefinitionSchema } from "./ErrorDefinitionSchema";
import { IdSchema } from "./IdSchema";
import { ServicesSchema } from "./ServicesSchema";
import { TypeDefinitionSchema } from "./TypeDefinitionSchema";

export const FernConfigurationSchema = z.strictObject({
    imports: z.optional(z.record(z.string())),
    ids: z.optional(z.array(IdSchema)),
    types: z.optional(z.record(TypeDefinitionSchema)),
    services: z.optional(ServicesSchema),
    errors: z.optional(z.record(z.union([z.string(), ErrorDefinitionSchema]))),
});

export type FernConfigurationSchema = z.infer<typeof FernConfigurationSchema>;
