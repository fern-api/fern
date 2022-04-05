import { z } from "zod";
import { IdSchema } from "./IdSchema";
import { ServicesSchema } from "./ServicesSchema";
import { TypeDefinitionSchema } from "./TypeDefinitionSchema";

export const FernSchema = z.strictObject({
    imports: z.optional(z.record(z.string())),
    ids: z.optional(z.record(IdSchema)),
    types: z.optional(z.record(TypeDefinitionSchema)),
    services: z.optional(ServicesSchema),
});

export type FernSchema = z.infer<typeof FernSchema>;
