import { z } from "zod";

import { BaseApiSettingsSchema } from "./BaseApiSettingsSchema";
import { MessageNamingVersionSchema } from "./MessageNamingVersionSchema";

/**
 * AsyncAPI-specific settings that extend the base API settings.
 * All settings use camelCase naming.
 */
export const AsyncApiSettingsSchema = BaseApiSettingsSchema.extend({
    /** What version of message naming to use for AsyncAPI messages, this will grow over time. Defaults to v1. */
    messageNaming: MessageNamingVersionSchema.optional()
});

export type AsyncApiSettingsSchema = z.infer<typeof AsyncApiSettingsSchema>;
