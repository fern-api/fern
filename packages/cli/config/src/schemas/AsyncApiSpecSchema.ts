import { z } from "zod";

import { BaseApiSettingsSchema } from "./BaseApiSettingsSchema";

/**
 * Controls the message naming version for AsyncAPI specs.
 */
export const MessageNamingVersionSchema = z.enum(["v1", "v2"]);

export type MessageNamingVersionSchema = z.infer<typeof MessageNamingVersionSchema>;

/**
 * AsyncAPI-specific settings that extend the base API settings.
 * All settings use camelCase naming.
 */
export const AsyncApiSettingsSchema = BaseApiSettingsSchema.extend({
    /** What version of message naming to use for AsyncAPI messages, this will grow over time. Defaults to v1. */
    messageNaming: MessageNamingVersionSchema.optional()
});

export type AsyncApiSettingsSchema = z.infer<typeof AsyncApiSettingsSchema>;

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
