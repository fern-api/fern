import { z } from "zod";
import { ErrorSchema } from "./ErrorSchema";
import { IdSchema } from "./IdSchema";
import { ServicesSchema } from "./ServicesSchema";
import { TypeDefinitionSchema } from "./TypeDefinitionSchema";

export const RawFernConfigurationSchema = z.strictObject({
    imports: z.optional(z.record(z.string())),
    ids: z.optional(z.array(IdSchema)),
    types: z.optional(z.record(TypeDefinitionSchema)),
    services: z.optional(ServicesSchema),
    errors: z.optional(z.record(ErrorSchema)),
});

export type RawFernConfigurationSchema = z.infer<typeof RawFernConfigurationSchema>;
