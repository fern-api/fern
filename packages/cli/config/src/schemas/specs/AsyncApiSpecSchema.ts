import { z } from "zod";

import { AsyncApiSettingsSchema } from "../settings/AsyncApiSettingsSchema";

/**
 * Schema for AsyncAPI spec definition in fern.yml.
 */
export const AsyncApiSpecSchema = z.object({
    /** Path to the AsyncAPI specification file. */
    asyncapi: z.string(),

    /** URL origin for the AsyncAPI spec (for remote specs). */
    origin: z.string().optional(),

    /** Path to overrides file for the AsyncAPI spec. */
    overrides: z.string().optional(),

    /** Namespace for the API (used in multi-API configurations). */
    namespace: z.string().optional(),

    /** AsyncAPI-specific settings. */
    settings: AsyncApiSettingsSchema.optional()
});

export type AsyncApiSpecSchema = z.infer<typeof AsyncApiSpecSchema>;
