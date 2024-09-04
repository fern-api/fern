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

export const APIConfigurationV2Schema = z.strictObject({
    "default-environment": z.optional(z.string().or(z.null())),
    environments: z.optional(z.record(z.string(), RawSchemas.EnvironmentSchema)),
    specs: z.array(SpecSchema)
});
