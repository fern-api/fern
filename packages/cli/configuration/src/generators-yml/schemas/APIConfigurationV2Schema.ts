import { z } from "zod";
import { RawSchemas } from "@fern-api/fern-definition-schema";

export const OpenAPISpecSchema = z.strictObject({
    openapi: z.string(),
    overrides: z.string().optional(),
    namespace: z.string().optional()
});

export type OpenAPISpecSchema = z.infer<typeof OpenAPISpecSchema>;

export const AsyncAPISchema = z.strictObject({
    openapi: z.string(),
    overrides: z.string().optional(),
    namespace: z.string().optional()
});

export type AsyncAPISchema = z.infer<typeof OpenAPISpecSchema>;

export const SpecSchema = z.union([OpenAPISpecSchema, AsyncAPISchema]);

export const APIConfigurationV2Schema = RawSchemas.WithEnvironmentsSchema.extend({
    specs: z.array(SpecSchema)
});
