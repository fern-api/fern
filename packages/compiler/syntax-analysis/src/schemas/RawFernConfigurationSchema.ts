import { z } from "zod";
import { ErrorDefinitionSchema } from "./ErrorDefinitionSchema";
import { IdSchema } from "./IdSchema";
import { ServicesSchema } from "./ServicesSchema";
import { TypeDefinitionSchema } from "./TypeDefinitionSchema";

export const RawFernConfigurationSchema = z.strictObject({
    imports: z.optional(z.record(z.string())),
    ids: z.optional(z.array(IdSchema)),
    types: z.optional(z.record(z.union([z.string(), TypeDefinitionSchema]))),
    services: z.optional(ServicesSchema),
    errors: z.optional(z.record(ErrorDefinitionSchema)),
});

export type RawFernConfigurationSchema = z.infer<typeof RawFernConfigurationSchema>;
