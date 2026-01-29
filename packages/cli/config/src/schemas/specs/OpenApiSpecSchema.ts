import { z } from "zod";

import { OpenApiSettingsSchema } from "../settings/OpenApiSettingsSchema";

/**
 * Schema for OpenAPI spec definition in fern.yml.
 */
export const OpenApiSpecSchema = z.object({
    /** Path to the OpenAPI specification file. */
    openapi: z.string(),

    /** URL origin for the OpenAPI spec (for remote specs). */
    origin: z.string().optional(),

    /** Path to overrides file for the OpenAPI spec. */
    overrides: z.string().optional(),

    /** Path to overlays file for the OpenAPI spec. */
    overlays: z.string().optional(),

    /** Namespace for the API (used in multi-API configurations). */
    namespace: z.string().optional(),

    /** OpenAPI-specific settings. */
    settings: OpenApiSettingsSchema.optional()
});

export type OpenApiSpecSchema = z.infer<typeof OpenApiSpecSchema>;
